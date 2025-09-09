function generate(n: number): string {
    const add = 1,
      max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.
  
    if (n > max) {
      return generate(max) + generate(n - max);
    }
  
    const maxValue = Math.pow(10, n + add);
    const min = maxValue / 10; // Math.pow(10, n) basically
    const number = Math.floor(Math.random() * (maxValue - min + 1)) + min;
  
    return ("" + number).substring(add);
  }
  

  export function capitalizeFirstLetter(word: string): string {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  export default  generate;
  