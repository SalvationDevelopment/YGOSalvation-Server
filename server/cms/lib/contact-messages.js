/**
 * Serializes contact message used by the contact messages module.
 * @param {Object} entry The entry object supplies the structured input used by the contact messages module, including the `_id`, `classification`, `createdAt`, `email`, `message`, `name`, `subject`, `updatedAt`, and `username` properties.
 * @param {string} entry._id The `_id` property supplies structured input used by the contact messages module.
 * @param {string} entry.classification The `classification` property supplies structured input used by the contact messages module.
 * @param {Date} entry.createdAt The `createdAt` property supplies structured input used by the contact messages module.
 * @param {string} entry.email The `email` property supplies structured input used by the contact messages module.
 * @param {string} entry.message The `message` property supplies structured input used by the contact messages module.
 * @param {string} entry.name The `name` property supplies structured input used by the contact messages module.
 * @param {string} entry.subject The `subject` property supplies structured input used by the contact messages module.
 * @param {Date} entry.updatedAt The `updatedAt` property supplies structured input used by the contact messages module.
 * @param {string} entry.username The `username` property supplies structured input used by the contact messages module.
 * @returns {Object} Returns the value produced by the contact messages module.
 */
export function serializeContactMessage(entry) {
  return {
    id: entry._id.toString(),
    classification: entry.classification,
    name: entry.name,
    email: entry.email,
    username: entry.username || "",
    subject: entry.subject || "",
    message: entry.message,
    status: entry.status,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  };
}
