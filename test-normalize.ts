const normalizeString = (str: string) => {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, ""); // remove spaces and special chars
};

console.log(normalizeString("Término de prueba"));
console.log(normalizeString("termino de prueba"));
