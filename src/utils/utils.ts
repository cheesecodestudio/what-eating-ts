import { format } from 'date-fns';

/**
 * returns a valid string parse to JSON
 * @returns 
 */
export const generarId = () => {
    const fecha = Date.now().toString(25)
    const random = Math.random().toString(25).substring(2)
    return `${fecha}_${random}`
}

/**
 * Do format to date > Jun 2nd, 2024
 * @param {string} date 
 * @returns 
 */
export const dateFormat = (date: string) => {
    return format(date, "MMM do, yyyy");
}

// /**
//  * returns a valid string parse to JSON
//  * @param {string} string 
//  * @param {boolean} isSheet 
//  * @returns 
//  */
// export function isJSON(string, isSheet = false) {
//     let json;
//     if (isSheet) string = string.substr(47).slice(0, -2);
//     try {
//         json = JSON.parse(string);
//     } catch (error) {
//         return { status: 'error' };
//     }
//     return json;
// }

// export function clearStorage(){
//     const lastVisit = localStorage.getItem('lastVisit');
  
//     // Si el usuario ya ha visitado la página antes
//     if (lastVisit) {
//       const currentTime = new Date().getTime();
//       const oneHour = 60 * 60 * 1000; // 1 horas en milisegundos
  
//       // Si ha pasado 1 horas desde la última visita
//       if (currentTime - lastVisit > oneHour) {
//         localStorage.clear(); // Limpia el localStorage
//         localStorage.setItem('lastVisit', currentTime.toString()); // Guarda la hora de la visita actual
//       }
//     } 
//     // Si es la primera vez que el usuario visita la página
//     else {
//       const currentTime = new Date().getTime();
//       localStorage.setItem('lastVisit', currentTime.toString()); // Guarda la hora de la visita actual
//     }
// }