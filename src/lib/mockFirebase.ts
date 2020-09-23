import firebasemock from 'firebase-mock'

// const mockauth = new firebasemock.MockAuthentication()
// const mockdatabase = new firebasemock.MockFirebase()
const mockfirestore = new firebasemock.MockFirestore()
// const mockstorage = new firebasemock.MockStorage()
// const mockmessaging = new firebasemock.MockMessaging()
const mocksdk = new firebasemock.MockFirebaseSdk(
  // use null if your code does not use RTDB
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_path: unknown) => {
    // return path ? mockdatabase.child(path) : mockdatabase
    return null
  },
  // use null if your code does not use AUTHENTICATION
  () => {
    // return mockauth
    return null
  },
  // use null if your code does not use FIRESTORE
  () => {
    return mockfirestore
  },
  // use null if your code does not use STORAGE
  () => {
    // return mockstorage
    return null
  },
  // use null if your code does not use MESSAGING
  () => {
    // return mockmessaging
    return null
  }
)
mocksdk.firestore().autoFlush()
export default mocksdk

// console.log(mockauth)
// console.log(mockdatabase)
// console.log(mockmessaging)
// console.log(mockstorage)
