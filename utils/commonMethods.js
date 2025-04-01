export const deepEqual = (val1, val2) => {
  if (val1 === val2) return true;
  if (
    typeof val1 !== "object" ||
    typeof val2 !== "object" ||
    val1 === null ||
    val2 === null
  )
    return false;

  if (Array.isArray(val1) !== Array.isArray(val2)) return false;

  let keys1 = Object.keys(val1);
  let keys2 = Object.keys(val2);
  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(val1[key], val2[key])) return false;
  }
  return true;
};

export const syncArray = (clientArray, serverArray) => {
  const objectMap = new Map();

  clientArray.forEach((clientObject) => {
    clientObject.updatedAt = new Date(clientObject.updatedAt);
    objectMap.set(clientObject.id, clientObject);
  });

  serverArray.forEach((serverObject) => {
    serverObject.updatedAt = new Date(serverObject.updatedAt);
    if (!objectMap.has(serverObject.id)) {
      objectMap.set(serverObject.id, serverObject);
    } else {
      const clientObject = objectMap.get(serverObject.id);
      if (clientObject.updatedAt.getTime() < serverObject.updatedAt.getTime()) {
        objectMap.set(serverObject.id, serverObject);
      }
    }
  });

  const syncedArray = Array.from(objectMap.values());
  return syncedArray.filter((object) => !object.deleted);
};
