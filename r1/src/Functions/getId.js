function getId(key) {
    let id = localStorage.getItem(key);

    if (id === null){
        
        localStorage.setItem(key, 1);
        return 1;
    }

    id = parseInt(id);                   // padarau skaiciumi
    id++
    localStorage.setItem(key, id);
    return id;
}

export default getId;