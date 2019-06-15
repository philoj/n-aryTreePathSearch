const DEFAULT_SUB_NODES_PROPERTY = 'sub_categories';
const loggerName = '[NTreeSearch]';
export interface NodeObjectBase {
    id: number;
    [DEFAULT_SUB_NODES_PROPERTY]: Array<NodeObjectBase>; // this property name can be customised but value should be correct.
}

export interface PathMatch<T> {
    node: T;
    child: PathMatch<T> | null; // null for innermost node.
}
/**
 * Search inside a N-ary tree to find first matching chain of nodes starting from root level node(s),
 * connecting all ids in the given id pool.
 * *(Originally implemented to search through the allAvailableFilters.category object,
 * which is practically an N-tree
 * to find the original category tree of a given product's category id list,
 * whoes order cannot be ascertained.)*
 * @param nodeIdPool The list of unique ids of nodes to connect through, IN ANY ORDER
 * @param rootNodeList List of Node objects in the root level, to start from.
 * @param subNodesProperty The name of the property inside the given node objects containing the array of its children.
 */
export function findTraversibleNode<NodeObject extends NodeObjectBase>(
    nodeIdPool: Array<number>,
    rootNodeList: Array<NodeObject>,
    subNodesProperty = DEFAULT_SUB_NODES_PROPERTY): PathMatch<NodeObject> | null {
    // first filter node id pool with root node ids only
    const rootNodeIdList = rootNodeList.map(node => node.id).filter(id => nodeIdPool.includes(id));
    const idStack = [...rootNodeIdList];
    while (idStack.length > 0) {
        const potentialParentNodeId = idStack.shift(); // pop the first id, update list 'in place'
        const potentialParentNode = rootNodeList.find(n => n.id === potentialParentNodeId);
        console.group();
        console.log(
            `${loggerName} Trying node: ${potentialParentNodeId} from original pool:${
            nodeIdPool} filtered to:${rootNodeIdList} Remaining: ${idStack}`);
        // remaining node ids in the pool excluding the selected potentialParentNode
        const remainingNodeIds = removeItemFromUniqueItemArray(potentialParentNodeId, nodeIdPool);
        if (remainingNodeIds.length === 0) {
            // no more sub nodes to look for: traversal complete if parentNode is found.
            if (potentialParentNode) {
                console.log(`${loggerName} Traversal success: ${potentialParentNodeId}`);
                console.groupEnd();
                return {
                    node: potentialParentNode,
                    child: null
                };
            } else {
                console.log(`${loggerName} Traversal broke at last node`);
                console.groupEnd();
                return null;
            }
        } else {
            // sub nodes has to be looked for
            // check whether traversal can continue inside
            // current potential node's sub nodes or not

            // a list of potential sub nodes has to be found from remaining node ids:
            const potentialSubNodes = potentialParentNode[subNodesProperty].filter(subNode => remainingNodeIds.includes(subNode.id));
            if (potentialSubNodes.length === 0) {
                console.log(`${loggerName} Cannot traverse further: ${potentialParentNodeId}: No more sub node matches`);
                console.groupEnd();
                continue;
            } else {
                const nextTraversibleNode = findTraversibleNode<NodeObject>(remainingNodeIds, potentialSubNodes);
                if (!nextTraversibleNode) {
                    // no more potential sub nodes in this node
                    // or traversal cannot continue
                    // find another potential parent node
                    // and repeat
                    console.log(`${loggerName} Cannot traverse further: ${potentialParentNodeId}: No more traversible nodes`);
                    console.groupEnd();
                    continue;
                } else {
                    // if traversal possible, return potentialParentNode with child
                    console.log(`${loggerName} Traversal success: ${potentialParentNodeId}`);
                    console.groupEnd();
                    return {
                        node: potentialParentNode,
                        child: nextTraversibleNode
                    };
                }
            }
        }

    }
    // no potential parent nodes
    return null;
}
/**
 * Auxilliary method to quickly exclude elements from unique id array.
 * @param item Item to exclude
 * @param array Original array of items
 * @returns Excluded array
 */
function removeItemFromUniqueItemArray<T>(item: T, array: Array<T>): Array<T> {
    const set = new Set(array);
    set.delete(item);
    return Array.from(set);
}
