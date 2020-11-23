import firebase from 'firebase/app';

export default function DeleteMessages(rid: string, uid: string) {
    const collection = firebase.firestore().collection('rooms').doc(rid).collection('chat');

    collection.where('uid', '==', uid).get().then(r => {
        const batch = firebase.firestore().batch();

        r.docs.forEach(doc => {
            const ref = collection.doc(doc.id);
            batch.update(ref, { message: 'This message has been deleted.' });
        });
        batch.commit();
    });
}
