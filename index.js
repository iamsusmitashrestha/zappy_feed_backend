import express from "express";
import mysql from "promise-mysql";
import jwt from "jwt-then";
import authMiddleware from "./middlewares/auth.js";

//Creating Server
const app = express();

app.use(express.json());

app.get("/users/myprofile", authMiddleware, async (req, res) => {
  const id = req.payload.id;

  //create connection
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "zappy_feed",
    });
    const results = await connection.query(
      "SELECT id,name,email from users where id=?",
      [id]
    );

    if (results.length === 0) {
      res.status(404).json({
        message: "User not found.",
      });
    } else {
      res.json({
        user: results[0],
      });
    }
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.get("/users/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  //create connection
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "zappy_feed",
    });
    const results = await connection.query(
      "SELECT id,name,email from users where id=?",
      [id]
    );

    if (results.length === 0) {
      res.status(404).json({
        message: "User not found.",
      });
    } else {
      res.json({
        user: results[0],
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.get("/greet/:name", async (req, res) => {
  const name = req.params.name;
  res.json({
    greeting: "Good morning " + name,
  });
});

app.post("/users/register", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "zappy_feed",
    });
    if (!req.body.name) {
      res.status(403).json({ message: "Name is required." });
    } else if (!req.body.email) {
      res.status(403).json({ message: "Email is required." });
    } else if (!req.body.password) {
      res.status(403).json({ message: "Password is required." });
    } else if (req.body.password.length < 8 || req.body.password.length > 20) {
      res.status(403).json({
        message: "Password length must be between 8 to 20 characters.",
      });
    } else if (!req.body.email.includes("@")) {
      res.status(403).json({
        message: "Enter a valid email.",
      });
    } else if (!req.body.name.includes(" ")) {
      res.status(403).json({
        message: "Enter full name.",
      });
    } else {
      const results = await connection.query(
        "SELECT * FROM `users` WHERE email=?",
        [req.body.email]
      );
      if (results.length > 0) {
        res.status(403).json({
          message: "Email already exist.",
        });
      } else {
        const result = await connection.query(
          "INSERT INTO users(name,email,password) VALUES(?,?,?) ",
          [req.body.name, req.body.email, req.body.password]
        );

        res.json({
          message: "Registered successfully.",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.post("/users/login", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "zappy_feed",
    });
    if (!req.body.email) {
      res.status(403).json({ message: "Email is required." });
    } else if (!req.body.password) {
      res.status(403).json({ message: "Password is required." });
    } else {
      const result = await connection.query(
        "SELECT * FROM users WHERE email=? AND password=?",
        [req.body.email, req.body.password]
      );
      if (result.length > 0) {
        const token = await jwt.sign(
          {
            id: result[0].id,
          },
          "tero tauko"
        );
        res.json({ message: "Login successfully", token: token });
      } else {
        res.status(403).json({ message: "Email and password did not match." });
      }
    }
  } catch (error) {
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.post("/post/text", authMiddleware, async (req, res) => {
  const user_id = req.payload.id;
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "zappy_feed",
    });

    if (!req.body.caption) {
      res.status(403).json({ message: "Caption is required." });
    } else {
      const result = await connection.query(
        "INSERT INTO posts(caption,image,created_at,user_id) VALUES(?,?,?,?)",
        [req.body.caption, req.body.image, Date.now(), user_id]
      );
      res.json({
        message: "Posted.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.post("/post/:id/comment", authMiddleware, async (req, res) => {
  const user_id = req.payload.id;
  const post_id = req.params.id;

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "zappy_feed",
    });

    if (!req.body.caption) {
      res.status(403).json({ message: "Caption is required." });
    } else {
      const result = await connection.query(
        "INSERT INTO comments(caption,date,user_id,post_id) VALUES(?,?,?,?)",
        [req.body.caption, Date.now(), user_id, post_id]
      );
      res.json({
        message: "Commented.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.get("/recentposts", authMiddleware, async (req, res) => {
  const user_id = req.payload.id;
  const post_id = req.params.id;
  //create connection
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "zappy_feed",
    });
    const results = await connection.query(
      "SELECT posts.id,posts.caption,posts.image,posts.created_at,users.name,users.id(SELECT COUNT(*)  FROM likes WHERE post_id=posts.id) AS like_count, (SELECT COUNT(*) FROM likes WHERE post_id=posts.id AND user_id=?) AS is_liked FROM `posts` INNER JOIN `users` ON users.id=posts.user_id",
      [user_id]
    );

    if (results.length === 0) {
      res.status(404).json({
        message: "Posts not found.",
      });
    } else {
      res.json({
        posts: results,
      });
    }
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.get("/posts/:post_id/viewcomment", authMiddleware, async (req, res) => {
  //create connection
  const post_id = req.params.post_id;
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "zappy_feed",
    });
    const results = await connection.query(
      "SELECT * FROM `comments` WHERE post_id=?",
      [post_id]
    );

    if (results.length === 0) {
      res.status(404).json({
        message: "Comments not found.",
      });
    } else {
      res.json({
        comments: results,
      });
    }
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.post("/post/:id/like", authMiddleware, async (req, res) => {
  const user_id = req.payload.id;
  const post_id = req.params.id;

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "zappy_feed",
    });

    const results = await connection.query(
      "SELECT  * from likes WHERE user_id=? and post_id=?",
      [user_id, post_id]
    );
    console.log(results.user_id);

    if (results.length > 0) {
      const result = await connection.query(
        " DELETE FROM likes WHERE user_id=? and post_id=? ",
        [user_id, post_id]
      );
    } else {
      const result = await connection.query(
        "INSERT INTO likes(user_id,post_id) VALUES(?,?)",
        [user_id, post_id]
      );
      res.json({
        message: "Liked.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.listen(8000, () => {
  console.log("Server Listening");
});
