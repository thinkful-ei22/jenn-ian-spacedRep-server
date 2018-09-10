class _SllNode {
    constructor(key, value, next) {
        this.key = key;
        this.value = value;
        this.next = next;
    }
}

class SingleLinkedList {
    constructor() {
        this.head = null;
    }
    insertFirst(key, value) {
        if (this.head === null)
            this.head = new _SllNode(key, value, null);
        else {
            const newNode = new _SllNode(key, value, this.head);
            this.head = newNode;
        }
    }
    insertLast(key, value) {
        if (this.head === null)
            this.head = new _SllNode(key, value, null);
        else {
            let curNode = this.head;
            while (curNode.next !== null) {
                curNode = curNode.next;
            }
            curNode.next = new _SllNode(key, value, null);
        }
    }
    remove(key) {
        let curNode = this.head;
        let prevNode;

        while (curNode !== null && curNode.key !== key) {
            prevNode = curNode;
            curNode = curNode.next;
        }
        if (curNode === null) {
            console.log('Linked list: Could not find val to delete');
            return -1;
        } else {
            prevNode.next = curNode.next;
            //TODO: free old node? maybe
            return 1;
        }
    }
    find(key) {
        let curNode = this.head;

        while (curNode !== null && curNode.key !== key) {
            curNode = curNode.next;
        }

        if (curNode === null)
            return null;
        else
            return curNode;
    }
    insertBefore(key, val) {
        let curNode = this.head;
        let prevNode;

        while (curNode !== null && curNode.key !== key) {
            prevNode = curNode;
            curNode = curNode.next;
        }

        if (curNode === null) {
            console.log('Linked list: Could not find val to insert before');
            return -1;
        } else if (curNode === this.head) {
            let newNode = new _SllNode(key, val, curNode);

            this.head = newNode;
        }

        else {
            let newNode = new _SllNode(key, val, curNode);
            prevNode.next = newNode;
            //TODO: free old node? maybe
            return 1;
        }
    }
    insertAfter(newVal, targetVal) {
        let curNode = this.head;
        let nextNode;

        while (curNode !== null && curNode.value !== targetVal) {
            curNode = curNode.next;
            nextNode = curNode.next;

        }

        if (curNode === null) {
            console.log('Linked list: Could not find val to insert after');
            return -1;
        } else {
            let newNode = new _SllNode(newVal, curNode.next);
            curNode.next = newNode;
            //TODO: free old node? maybe
            return 1;
        }
    }
    insertAt(newVal, targetPos) {
        let curNode = this.head, counter = 0;
        let prevNode;


        while (curNode !== null && counter !== targetPos) {
            prevNode = curNode;
            curNode = curNode.next;
            counter++;
        }

        if (curNode === null) {
            console.log('Linked list: Could not find position to insert at');
            return -1;
        } else if (targetPos === 0) {
            let newNode = new _SllNode(newVal, curNode);

            this.head = newNode;
        }

        else {
            let newNode = new _SllNode(newVal, curNode.next);

            prevNode.next = newNode;
            //TODO: free old node? maybe
            return 1;
        }
    }
    display() {
        let curNode = this.head;

        console.log('Linked List: ');

        while (curNode !== null) {
            console.log(`${curNode.key}: ${curNode.value}`);
            curNode = curNode.next;
        }
    }
}

const hola = {spanish: "hola", english: "hello"};
const adios = {spanish: "adios", english: "goodbye"};
const gracias = {spanish: "gracias", english: "thank you"};
const uno = {spanish: "uno", english: "one"};
const dos = {spanish: "dos", english: "two"};
const tres = {spanish: "tres", english: "three"};
const rojo = {spanish: "rojo", english: "red"};
const verde = {spanish: "verde", english: "green"};
const azul = {spanish: "azul", english: "blue"};
const amarillo = {spanish: "amarillo", english: "yellow"};
const purpura = {spanish: "purpura", english: "purple"};

let wordList = new SingleLinkedList();
wordList.insertFirst(1, hola);
wordList.insertFirst(2, adios);
wordList.insertFirst(3, gracias);
wordList.insertFirst(4, uno);
wordList.insertFirst(5, dos);
wordList.insertFirst(6, tres);
wordList.insertFirst(7, rojo);
wordList.insertFirst(8, verde);
wordList.insertFirst(9, azul);
wordList.insertFirst(10, amarillo);
wordList.insertFirst(11, purpura);

console.log(wordList.display());
console.log(wordList);


module.exports = { SingleLinkedList, wordList };