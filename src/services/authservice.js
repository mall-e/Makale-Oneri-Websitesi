import { auth } from '../firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { db } from '../firebase-config';

export const handleLogin = async (email, password) => {
	try {
		await signInWithEmailAndPassword(auth, email, password);
		console.log("Logged in successfully!");
		return true;
	} catch (error) {
		console.error("Login failed:", error);
		return false;
	}
};

export const handleSignup = async (email, password, confirmPassword, interests) => {
    try {
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(userCredential.user);
		await saveInterests(userCredential.user, interests);
        console.log("Signed up successfully!", userCredential);
    } catch (error) {
        console.error("Signup failed:", error);
    }
};

export const saveUserToFirestore = async (user) => {
	await setDoc(doc(db, "users", user.uid), {
		email: user.email,
		createdAt: new Date()
	});
};

export const saveInterests = async (user, interests) => {
    try {
        const userRef = doc(db, "users", user.uid);
        const interestsCollectionRef = collection(userRef, "interests");

        // İlgi alanlarını kullanıcının ilgi alanları koleksiyonuna ekleyin
        const batch = writeBatch(db);  // Firestore batch işlemi kullanarak tüm ilgi alanlarını bir seferde ekleyin
        interests.forEach((interest, index) => {
            const interestRef = doc(interestsCollectionRef, `interest${index}`);  // Her ilgi alanı için bir belge ID oluşturun
            batch.set(interestRef, { name: interest });
        });
        await batch.commit();  // Batch işlemi tamamlayın
        console.log("Interests saved successfully!");
    } catch (error) {
        console.error("Failed to save interests:", error);
    }
}

export const logout = (callback) => {
    auth.signOut().then(() => {
        console.log("Çıkış yapıldı.");
        callback();  // Çıkış işlemi sonrasında geri dönüş fonksiyonu çağırılıyor
    }).catch((error) => {
        console.error("Çıkış yapılırken bir hata oluştu: ", error);
    });
}


