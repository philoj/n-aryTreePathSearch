import { findTraversibleNode } from "./nTree-Search";

const fs = require('fs');
let categories = JSON.parse(fs.readFileSync('categories.json'));

// console.log(filters.categories);
// let result = findTraversibleNode([11, 4, 1], categories);
let result = findTraversibleNode([2,4,11], categories);
console.log(result.node.id, result.child.node.id, result.child.child.node.id);

