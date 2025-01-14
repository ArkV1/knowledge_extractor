export default {
    id: "sql",
    comments: {
      singleline: "--",
      multiline: ["/*", "*/"]
    },
    snippets: {
      select: "SELECT $1 FROM $2",
      insert: "INSERT INTO $1 ($2) VALUES ($3)",
      update: "UPDATE $1 SET $2 WHERE $3",
      delete: "DELETE FROM $1 WHERE $2",
      create: "CREATE TABLE $1 ($2)",
      alter: "ALTER TABLE $1 $2",
      drop: "DROP TABLE $1",
      custom: function (keyword) {
        // Custom snippet logic for SQL keywords
        const upperKeyword = keyword.toUpperCase();
        switch (upperKeyword) {
          case "WHERE":
            return "WHERE $1 = $2";
          case "JOIN":
            return "JOIN $1 ON $2 = $3";
          case "GROUP":
            return "GROUP BY $1";
          case "ORDER":
            return "ORDER BY $1 ASC";
          default:
            return upperKeyword;
        }
      }
    }
  };