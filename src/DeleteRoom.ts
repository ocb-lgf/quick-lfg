import firebase from 'firebase/app';

export default function DeleteRoom(rid: string) {
    firebase.firestore().collection('rooms').doc(rid)
        .delete().then(() => {
        }).catch((e) => {
            console.log({ e });
        });
}
