/**
 * Debug helper to log DocumentFragment contents
 * @param {DocumentFragment} fragment - Fragment to inspect
 */
export const logFragment = (fragment) => {
  const elements = Array.from(fragment.children);

  const fragmentStructure = elements.map((el) => ({
    tagName: el.tagName,
    className: el.className,
    id: el.id,
    children: el.children.length,
    attributes: Array.from(el.attributes).map((attr) => ({
      name: attr.name,
      value: attr.value
    }))
  }));

  console.log(JSON.stringify(fragmentStructure, null, 2));
};
