import axios from 'axios';

export const fetchDrivers = async () => {
  try {
    const response = await axios.get('https://api.openf1.org/v1/drivers');
    const drivers = response.data;

    // Créer un Map pour stocker les pilotes uniques
    const uniqueDriversMap = new Map();

    drivers.forEach((driver: any) => {
      // Vérifier si le pilote a une photo
      if (driver.headshot_url) {
        // Vérifier si le pilote est déjà dans le Map
        if (!uniqueDriversMap.has(driver.full_name)) {
          // Ajouter le pilote s'il n'existe pas encore
          uniqueDriversMap.set(driver.full_name, driver);
        } else {
          // Si le pilote existe déjà, comparer et garder l'information la plus récente
          const existingDriver = uniqueDriversMap.get(driver.full_name);
          if (driver.session_key > existingDriver.session_key) {
            uniqueDriversMap.set(driver.full_name, driver);
          }
        }
      }
    });

    // Convertir le Map en tableau pour retourner
    const uniqueDrivers = Array.from(uniqueDriversMap.values());

    // Trier les pilotes par driver_number en ordre croissant
    uniqueDrivers.sort((a, b) => a.driver_number - b.driver_number);

    return uniqueDrivers;
  } catch (error) {
    throw new Error(`Failed to fetch drivers: ${error}`);
  }
};



/*import axios from 'axios';

export const fetchDrivers = async () => {
  try {
    const response = await axios.get('https://api.openf1.org/v1/drivers');
    const drivers = response.data;

    // Créer un Map pour stocker les pilotes uniques
    const uniqueDriversMap = new Map();

    drivers.forEach((driver: any) => {
      // Vérifier si le pilote est déjà dans le Map
      if (!uniqueDriversMap.has(driver.full_name)) {
        // Ajouter le pilote s'il n'existe pas encore
        uniqueDriversMap.set(driver.full_name, driver);
      } else {
        // Si le pilote existe déjà, comparer et garder l'information la plus récente
        const existingDriver = uniqueDriversMap.get(driver.full_name);
        if (driver.session_key > existingDriver.session_key) {
          uniqueDriversMap.set(driver.full_name, driver);
        }
      }
    });

    // Convertir le Map en tableau pour retourner
    const uniqueDrivers = Array.from(uniqueDriversMap.values());
    return uniqueDrivers;
  } catch (error) {
    throw new Error(`Failed to fetch drivers: ${error}`);
  }
};
*/
