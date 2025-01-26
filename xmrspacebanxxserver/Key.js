function generateSecurePassword(length = 12) {
    const characters = 'abcdefg0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }
    
    return password;
  }
  
  // Genera una contraseña de 16 caracteres por defecto
  console.log(generateSecurePassword(12));
  