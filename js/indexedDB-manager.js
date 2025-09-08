// Manages all IndexedDB operations for the expense tracking app
// This script replaces localStorage with IndexedDB for data persistence

// Database configuration
const DB_NAME = "ExpenseTrackerDB";
const DB_VERSION = 1;
const STORE_NAME = "expenses";

// Opens (or creates) the IndexedDB database
function openDatabase() {
    return new Promise((resolve, reject) => {
        // Open a connection to the database
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Handle database schema creation or upgrade
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create an object store called 'expenses' with an auto-incrementing 'id' key
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        };

        // Handle successful database opening
        request.onsuccess = (event) => {
            resolve(event.target.result); // Return the database object
        };

        // Handle errors
        request.onerror = (event) => {
            reject("Erro ao abrir o banco de dados: " + event.target.errorCode);
        };
    });
}

// Adds a new expense to the IndexedDB
function addExpense(expense) {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(expense); // Add the expense object

            request.onsuccess = () => {
                resolve(request.result); // Returns the ID of the new expense
            };

            request.onerror = () => {
                reject("Erro ao adicionar despesa: " + request.error);
            };
        });
    });
}

// Retrieves all expenses from the IndexedDB
function getAllExpenses() {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result); // Returns an array of all expenses
            };

            request.onerror = () => {
                reject("Erro ao recuperar despesas: " + request.error);
            };
        });
    });
}

// Updates an existing expense in the IndexedDB
function updateExpense(expense) {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(expense); // Put updates or adds the expense (based on ID)

            request.onsuccess = () => {
                resolve(request.result); // Returns the ID of the updated expense
            };

            request.onerror = () => {
                reject("Erro ao atualizar despesa: " + request.error);
            };
        });
    });
}

// Deletes an expense from the IndexedDB by ID
function deleteExpense(id) {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id); // Delete the expense with the given ID

            request.onsuccess = () => {
                resolve(); // Deletion successful
            };

            request.onerror = () => {
                reject("Erro ao excluir despesa: " + request.error);
            };
        });
    });
}

// Clears all expenses from the IndexedDB (optional, for reset or testing)
function clearAllExpenses() {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                resolve(); // Clear successful
            };

            request.onerror = () => {
                reject("Erro ao limpar despesas: " + request.error);
            };
        });
    });
}