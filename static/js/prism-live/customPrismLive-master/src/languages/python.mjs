export default {
    id: "python",
    comments: {
      singleline: "#",
      multiline: ['"""', '"""']
    },
    snippets: {
      "def": "def $1($2):\n\t$3",
      "class": "class $1:\n\tdef __init__(self):\n\t\t$2",
      "if": "if $1:\n\t$2",
      "for": "for $1 in $2:\n\t$3",
      "while": "while $1:\n\t$2",
      "try": "try:\n\t$1\nexcept $2:\n\t$3",
      "import": "import $1",
      "from": "from $1 import $2",
      "print": "print($1)",
      custom: function (keyword) {
        // Custom snippet logic for Python keywords
        const lowerKeyword = keyword.toLowerCase();
        switch (lowerKeyword) {
          case "lambda":
            return "lambda $1: $2";
          case "with":
            return "with $1 as $2:\n\t$3";
          case "async":
            return "async def $1($2):\n\t$3";
          case "await":
            return "await $1";
          default:
            return lowerKeyword;
        }
      }
    }
  };