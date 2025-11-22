import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// const firebaseConfig = {
//     apiKey: "AIzaSyDB74dG-bCG8afLqmAXxMqxV6C4rJj92xY",
//     authDomain: "lifeaidtest-1e0d2.firebaseapp.com",
//     projectId: "lifeaidtest-1e0d2",
//     storageBucket: "lifeaidtest-1e0d2.appspot.com",
//     messagingSenderId: "628105333743",
//     appId: "1:628105333743:web:6e2f28228313718cefc41a",
//     measurementId: "G-W0V5Z8421N"
// };

const firebaseConfig = {
  apiKey: "AIzaSyCKM0rfYJbnsDjw-wC37eC9xpQf5OrxPLs",
  authDomain: "lifeaid-2af97.firebaseapp.com",
  projectId: "lifeaid-2af97",
  storageBucket: "lifeaid-2af97.firebasestorage.app",
  messagingSenderId: "935128450685",
  appId: "1:935128450685:web:cc6e56846db2cd4f84d314",
  measurementId: "G-R8FG7HMSZS"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };