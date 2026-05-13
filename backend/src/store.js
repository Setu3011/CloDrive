// const bcrypt = require('bcryptjs')

// const users = []
// const files = []
// let userId = 1
// let fileId = 1

// async function createUser({ username, email, password }) {
//   const existing = users.find((u) => u.email === email)
//   if (existing) {
//     throw new Error('User already exists')
//   }

//   const hashed = await bcrypt.hash(password, 10)
//   const user = { id: userId++, username, email, password: hashed }
//   users.push(user)
//   return { id: user.id, username: user.username, email: user.email }
// }

// function findUserByEmail(email) {
//   return users.find((u) => u.email === email) || null
// }

// function addFile({ ownerId, originalName, storedName, size }) {
//   const file = {
//     id: fileId++,
//     ownerId,
//     originalName,
//     storedName,
//     size,
//     url: `/uploads/${storedName}`,
//     createdAt: new Date().toISOString()
//   }
//   files.push(file)
//   return file
// }

// function listFilesByOwner(ownerId) {
//   return files.filter((f) => f.ownerId === ownerId)
// }

// module.exports = {
//   createUser,
//   findUserByEmail,
//   addFile,
//   listFilesByOwner
// }

