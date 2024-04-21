document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    let options = ['Vaihtoehto 1', 'Vaihtoehto 2', 'Vaihtoehto 3', 'Vaihtoehto 4', 'Vaihtoehto 5'];
    let colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF8333'];
    const radius = canvas.width / 2;
    let spinAngleStart = 10;
    let startAngle = 0;
    let spinSpeed = 1;
    const arc = Math.PI * 2 / options.length;
    let spinningSoundPlaying = false;
    let spinningSoundInterval;

    // Äänitehosteet
    const spinSound = new Audio('spinsound.mp3');
    const resultSound = new Audio('winner.mp3');
    const spinningSound = new Audio('start.mp3');
    const backgroundMusic = new Audio('music.mp3');

    // Musiikki oletuksena pois päältä
    backgroundMusic.pause();

    // Napin toiminta äänien käynnistämiseen/pysäyttämiseen
    const soundIconContainer = document.getElementById('soundIconContainer');
    const soundIcon = document.createElement('img');
    soundIcon.src = 'voiceoff.png';
    soundIcon.alt = 'Äänet päällä';
    soundIcon.style.width = '40px'; // Suurempi leveys
    soundIcon.style.height = '40px'; // Suurempi korkeus
    soundIconContainer.appendChild(soundIcon);

    let isSoundOn = false; // Äänet oletuksena pois päältä
    toggleSoundButton.addEventListener('click', function() {
        if (isSoundOn) {
            backgroundMusic.pause();
            spinningSound.pause();
            spinSound.pause();
            isSoundOn = false;
            soundIcon.src = 'voiceoff.png'; // Vaihdetaan kuvake äänet pois päältä -kuvakkeeksi
            soundIcon.alt = 'Äänet pois päältä'; // Vaihdetaan alt-teksti
            toggleSoundButton.textContent = 'Musiikki Päälle'; // Päivitetään painikkeen teksti
        } else {
            backgroundMusic.play();
            isSoundOn = true;
            soundIcon.src = 'voiceon.png'; // Vaihdetaan kuvake äänet päällä -kuvakkeeksi
            soundIcon.alt = 'Äänet päällä'; // Vaihdetaan alt-teksti
            toggleSoundButton.textContent = 'Musiikki Pois'; // Päivitetään painikkeen teksti
        }
    
    });

    function drawArrow() {
        // Piirrä nuolen reuna
        ctx.strokeStyle = '#000000'; // Musta väri reunalle
        ctx.lineWidth = 2; // Reunan leveys
    
        ctx.beginPath();
        ctx.moveTo(radius - 7, 25);
        ctx.lineTo(radius + 7, 25);
        ctx.lineTo(radius, 10);
        ctx.closePath();
        ctx.stroke();
    
        // Täytä nuoli valkoisella väriksi
        ctx.fillStyle = '#ffffff'; // Valkea väri täyttöön
        ctx.beginPath();
        ctx.moveTo(radius - 7, 25);
        ctx.lineTo(radius + 7, 25);
        ctx.lineTo(radius, 10);
        ctx.closePath();
        ctx.fill();
    }

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < options.length; i++) {
            if (!document.getElementById(`option_${i}`).checked) continue; // Skip drawing if option is unchecked
            const angle = startAngle + i * arc;
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(radius, radius, radius - 20, angle, angle + arc);
            ctx.lineTo(radius, radius);
            ctx.fill();

            ctx.save();
            ctx.fillStyle = 'black';
            ctx.translate(radius + Math.cos(angle + arc / 2) * (radius - 40), radius + Math.sin(angle + arc / 2) * (radius - 40));
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            const text = options[i];
            ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            ctx.restore();
        }

        // Piirrä nuoli jokaisen päivityksen yhteydessä
        drawArrow();
    }

    function spin() {
        const minSpinTime = 3000;
        const maxSpinTime = 6000;
        const initialSpinSpeed = 1;
        const minPlaybackRate = 0.5;
        const spinSoundThreshold = 0.1;
        const optionAngles = options.map((_, index) => (index + 0.5) * (360 / options.length));

        spinAngleStart = Math.random() * 10 + 10;
        const spinTimeTotal = Math.random() * (maxSpinTime - minSpinTime) + minSpinTime;

        function rotateWheel() {
            const spinAngle = spinAngleStart - easeOut((Date.now() - spinTimeStart), 0, spinAngleStart, spinTimeTotal);
            const adjustedSpinAngle = spinAngle * Math.PI / 180 * spinSpeed;
            startAngle += adjustedSpinAngle;
            drawWheel();

            const degrees = startAngle * 180 / Math.PI + 90;

            if ((Date.now() - spinTimeStart) < spinTimeTotal) {
                requestAnimationFrame(rotateWheel);

                if (!spinningSoundPlaying) {
                    setTimeout(() => {
                        spinningSound.play();
                    }, 1);
                    spinningSoundPlaying = true;
                }

                const remainingSpinTime = spinTimeTotal - (Date.now() - spinTimeStart);
                const playbackRate = initialSpinSpeed + (spinSpeed - initialSpinSpeed) * (remainingSpinTime / spinTimeTotal);
                spinningSound.playbackRate = Math.max(playbackRate, minPlaybackRate);

                optionAngles.forEach((angle, index) => {
                    const angleDiff = Math.abs(degrees - angle);
                    if (angleDiff <= spinSoundThreshold * 360 && spinSound.paused) {
                        spinSound.currentTime = 0;
                        spinSound.play();
                    }
                });
            } else {
                resultSound.play();
                spinningSound.pause();
                spinningSoundPlaying = false;
                clearInterval(spinningSoundInterval);

                setTimeout(function() {
                    const index = Math.floor((360 - degrees % 360) / (360 / options.length));
                    const winnerText = `Voittaja on: ${options[index]}`;
                    console.log(winnerText);
                    alert(winnerText);
                }, 600);
            }
        }

        const spinTimeStart = Date.now();
        rotateWheel();
    }

    function easeOut(t, b, c, d) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    }

    // Tapahtumakuuntelija nopeusalueen muutokselle
    document.getElementById('speedRange').addEventListener('input', function() {
        spinSpeed = parseInt(this.value);
    });

    

    document.getElementById('spin').addEventListener('click', spin);

    // Päivitä vaihtoehtojen listaus sivupaneelissa
    function updateOptionsList() {
        const optionsList = document.getElementById('optionsList');
        optionsList.innerHTML = '';
        options.forEach((option, index) => {
            const listItem = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `option_${index}`;
            checkbox.checked = true;
            checkbox.addEventListener('change', function() {
                if (!this.checked) {
                    options.splice(index, 1);
                    colors.splice(index, 1);
                    updateOptionsList();
                    drawWheel();
                }
            });
            listItem.appendChild(checkbox);
            const label = document.createElement('label');
            label.setAttribute('for', `option_${index}`);
            label.textContent = option;
            listItem.appendChild(label);
            optionsList.appendChild(listItem);
        });
    }

    // Lisää uusi vaihtoehto
    document.getElementById('addOptionBtn').addEventListener('click', function() {
        const newOptionInput = document.getElementById('newOption');
        const newOptionValue = newOptionInput.value.trim();
        if (newOptionValue !== '') {
            options.push(newOptionValue);
            colors.push('#' + Math.floor(Math.random()*16777215).toString(16));
            newOptionInput.value = '';
            updateOptionsList();
            drawWheel();
        }
    });

    // Poista kaikki vaihtoehdot
    document.getElementById('removeAllOptionsBtn').addEventListener('click', function() {
        options = [];
        colors = [];
        updateOptionsList();
        drawWheel();
    });

    // Napin toiminta valikon näyttämiseen/piilottamiseen
    const menuButton = document.getElementById('menuButton');
    const menuContent = document.querySelector('.menuContent');
    menuButton.addEventListener('click', function() {
        menuContent.classList.toggle('show');
    });

    // Valmiiden arpapohjien napit
    const premadeTemplates = document.querySelectorAll('.premade-template');
    premadeTemplates.forEach(button => {
        button.addEventListener('click', function() {
            const optionsString = this.getAttribute('data-options');
            options = optionsString.split(',').map(option => option.trim());
            colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF8333'].slice(0, options.length);
            updateOptionsList();
            drawWheel();
        });
    });

    updateOptionsList();
    drawWheel();
});


// Etsitään "In English" -napin id
const languageButton = document.getElementById('languageButton');

// Alustetaan muuttuja, joka kertoo nykyisen kielen
let currentLanguage = 'finnish';

// Lisätään klikkikuuntelija napille
languageButton.addEventListener('click', () => {
    // Jos nykyinen kieli on suomi, vaihdetaan englanniksi
    if (currentLanguage === 'finnish') {
        // Vaihdetaan kaikki tekstit englanniksi
        changeLanguageToEnglish();
        // Vaihdetaan napin teksti suomeksi
        languageButton.textContent = 'Suomeksi';
        // Päivitetään nykyinen kieli
        currentLanguage = 'english';
    } else { // Muulloin vaihdetaan suomeksi
        // Vaihdetaan kaikki tekstit suomeksi
        changeLanguageToFinish();
        // Vaihdetaan napin teksti englanniksi
        languageButton.textContent = 'In English';
        // Päivitetään nykyinen kieli
        currentLanguage = 'finnish';
    }
});

// Funktio, joka vaihtaa kaikki tekstit englanniksi
function changeLanguageToEnglish() {
    // Haetaan kaikki sivun tekstejä sisältävät elementit
    const elements = document.querySelectorAll('body *');

    // Käydään läpi kaikki elementit
    elements.forEach(element => {
        // Tarkistetaan, onko elementin teksti
        if (element.childNodes.length === 1 && element.firstChild.nodeType === Node.TEXT_NODE) {
            // Vaihdetaan elementin teksti englanniksi
            element.textContent = englishText(element.textContent.trim());
        }
    });
}

// Funktio, joka vaihtaa kaikki tekstit suomeksi
function changeLanguageToFinish() {
    // Haetaan kaikki sivun tekstejä sisältävät elementit
    const elements = document.querySelectorAll('body *');

    // Käydään läpi kaikki elementit
    elements.forEach(element => {
        // Tarkistetaan, onko elementin teksti
        if (element.childNodes.length === 1 && element.firstChild.nodeType === Node.TEXT_NODE) {
            // Vaihdetaan elementin teksti suomeksi
            element.textContent = finnishText(element.textContent.trim());
        }
    });
}

// Yksinkertainen funktio, joka kääntää suomen englanniksi
function englishText(text) {
    switch (text) {
        case 'Valikko':
            return 'Menu';
        case 'Oma tili':
            return 'My Account';
        case 'Valitse teema':
            return 'Choose Theme';
        case 'Valitse valmiita arpapohjia':
            return 'Choose Pre-made Templates';
        case 'Tee oma arpakone':
            return 'Create Your Own Randomizer';
        case 'Arpakone historia':
            return 'Randomizer History';
        case 'Musiikki Päälle':
            return 'Turn Music On';
        case 'Tekijät':
            return 'Authors';
        case 'Lisää uusi vaihtoehto':
            return 'Add New Option';
        case 'Lisää':
            return 'Add';
        case 'Poista kaikki vaihtoehdot':
            return 'Remove All Options';
        case 'Voitatko?':
            return 'Do you win?';
        case '1-5':
            return '1-5';
        case 'Autot':
            return 'Cars';
        case 'Ruoka':
            return 'Food';
        case 'Lihavalinnat':
            return 'Meat Choices';
        case 'McDonalds':
            return 'McDonald\'s';
        case 'Burger King':
            return 'Burger King';
        case 'Taco Bell':
            return 'Taco Bell';
        case 'KFC':
            return 'KFC';
        case 'Himaan syömään':
            return 'Home Eating';
        case 'Audi':
            return 'Audi';
        case 'Peugeot':
            return 'Peugeot';
        case 'BMW':
            return 'BMW';
        case 'Honda':
            return 'Honda';
        case 'Volkswagen':
            return 'Volkswagen';
        case 'Ensimmäinen':
            return 'First';
        case 'Toinen':
            return 'Second';
        case 'Kolmas':
            return 'Third';
        case 'Neljäs':
            return 'Fourth';
        case 'Viides':
            return 'Fifth';
        case 'Kana':
            return 'Chicken';
        case 'Nauta':
            return 'Beef';
        case 'Sika':
            return 'Pork';
        case 'Lammas':
            return 'Lamb';
        case 'Kalkkuna':
            return 'Turkey';
        case 'Pyöritä Onnenpyörää!':
            return 'Spin the wheel!';
        case 'Voitto':
            return 'Winner';
        case 'Ei voittoa':
            return 'No win';
        

      

        default:
            return text; // Jos ei ole määritelty käännöstä, palautetaan alkuperäinen teksti
    }
}

// funktio, joka kääntää englannista suomeksi
function finnishText(text) {
    switch (text) {
        case 'Menu':
            return 'Valikko';
        case 'My Account':
            return 'Oma tili';
        case 'Choose Theme':
            return 'Valitse teema';
        case 'Choose Pre-made Templates':
            return 'Valitse valmiita arpapohjia';
        case 'Create Your Own Randomizer':
            return 'Tee oma arpakone';
        case 'Randomizer History':
            return 'Arpakone historia';
        case 'Turn Music On':
            return 'Musiikki Päälle';
        case 'Authors':
            return 'Tekijät';
        case 'Add New Option':
            return 'Lisää uusi vaihtoehto';
        case 'Add':
            return 'Lisää';
        case 'Remove All Options':
            return 'Poista kaikki vaihtoehdot';
        case 'Do you win?':
            return 'Voitatko?';
        case '1-5':
            return '1-5';
        case 'Cars':
            return 'Autot';
        case 'Food':
            return 'Ruoka';
        case 'Meat Choices':
            return 'Lihavalinnat';
        case 'McDonald\'s':
            return 'McDonalds';
        case 'Burger King':
            return 'Burger King';
        case 'Taco Bell':
            return 'Taco Bell';
        case 'KFC':
            return 'KFC';
        case 'Home Eating':
            return 'Himaan syömään';
        case 'Audi':
            return 'Audi';
        case 'Peugeot':
            return 'Peugeot';
        case 'BMW':
            return 'BMW';
        case 'Honda':
            return 'Honda';
        case 'Volkswagen':
            return 'Volkswagen';
        case 'First':
            return 'Ensimmäinen';
        case 'Second':
            return 'Toinen';
        case 'Third':
            return 'Kolmas';
        case 'Fourth':
            return 'Neljäs';
        case 'Fifth':
            return 'Viides';
        case 'Chicken':
            return 'Kana';
        case 'Beef':
            return 'Nauta';
        case 'Pork':
            return 'Sika';
        case 'Lamb':
            return 'Lammas';
        case 'Turkey':
            return 'Kalkkuna';
        case 'Spin the wheel!':
                return 'Pyöritä Onnenpyörää!';
        case 'Winner':
                return 'Voitto';
        case 'No win':
                return 'Ei voittoa';
        default:
            return text; // Jos ei ole määritelty käännöstä, palautetaan alkuperäinen teksti
    }
}
