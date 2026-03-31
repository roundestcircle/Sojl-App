export const SoilTexTree = {
    id: 'start',
    question: 'Wie gut lässt sich der Boden ausrollen?',
    options: [
        {
            text: 'Nicht zwischen den Handtellern zu einer bleistiftdicken Wurst ausrollbar',
            next: 'tex1',
        },
        {
            text: 'Gerade zu einer Bleistiftdicken Wurst ausrollbar, aber nicht auf halbe Bleistiftstärke',
            next: 'tex2',
        },
        {
            text: 'Auf halbe Bleistiftsärke ausrollbar',
            next: 'tex3',
        },
    ],
    nodes: {
        tex1: {
            id: 'tex1',
            question: 'Wie fühlt sich der Boden zwischen den Fingern an? Wie sieht er aus?',
            options: [
                {
                    text: 'Kaum schmutzend, kaum Feinsubstanz in Fingerrillen, nicht bindig',
                    next: 'tex1a',
                },
                {
                    text: 'schmutzend, Feinsubstanz in den Fingerrillen, kaum bindig',
                    next: 'tex1b',
                },
                {
                    text: 'Schmutzend, Feinsubstanz in den Fingerrillen, etwas bindig',
                    next: 'tex1c',
                },
            ],
        },
        tex2: {
            id: 'tex2',
            question: 'Wie verhält sich eine Kugel mit 1cm Durchmesser?',
            options: [
                {
                    text: 'Haftet gut am Finger',
                    next: 'tex2a',
                },
                {
                    text: 'Haftet kaum am Finger',
                    next: 'tex2b',
                },
            ],
        },
        tex3: {
            id: 'tex3',
            question: 'Wie gut lässt sich die Wurst weiterformen?',
            options: [
                {
                    text: 'Ein Ring mit 3cm Durchmesser ist möglich',
                    next: 'tex3b',
                },
                {
                    text: 'Ein Ring mit 3cm Durchmesser ist nicht möglich, ohne dass die Wurst bricht',
                    next: 'tex3a',
                },
            ],
        },
        tex3b: {
            id: 'tex3b',
            question: 'Wie verhält sich der Boden nach quetschen zwischen Daumen und Zeigefinger?',
            options: [
                {
                    text: 'Er ist rau und schwach glänzend',
                    next: 'tex3ba',
                },
                {
                    text: 'Er ist rau und deutlich glänzend',
                    next: 'tex3bb',
                },
                {
                    text: 'Er ist glatt und stark glänzend',
                    next: 'tex3bc',
                }
            ],
        },
        tex1a: {
            id: 'tex1a',
            question: 'Der Boden enthält über 85% Sand',
            options: [
                {
                    text: 'Ja',
                    next: 'Ss',
                },
                {
                    text: 'Nein',   
                    next: 'tex1'
                },
            ],
        },
        tex1b: {
            id: 'tex1b',    
            question: 'Wie verhält sich der Boden weiter?',
            options: [
                {
                    text: 'sehr sandig (>52%), kaum bindig, schwach formbar, Kugel von 1cm haftet kaum am Finger',
                    next: 'Su',
                },
                {
                    text: 'Sandkörner noch sicht und fühlbar (12-50%), stumpf-mehlig',
                    next: 'Us',
                },
                {
                    text: 'Kaum Sandkörner, stumpf-mehlig',
                    next: 'Uu',
                },
            ],
        },
        tex1c: {
            id: 'tex1c',
            question: 'Sind die Sandkörner noch sicht- und fühlbar (8-25%), ist der Boden stumpf-mehlig, etwas bindig, schwach formbar, und eine Kugel mit 1cm Durchmesser haftet leich am Finger?',
            options: [
                {
                    text: 'Ja',
                    next: 'Ut',
                },
                {
                    text: 'Nein',   
                    next: 'tex1'
                },
            ],
        },
        tex2a: {
            id: 'tex2a',
            question: 'Wie verhält sich der Boden weiter?',
            options: [
                {   
                    text: 'sehr sandig (>60%), bindig, formbar, haftet deutlich am Finger',
                    next: 'St',
                },
                {
                    text: 'sandig (25-68%), bindig, formbar, haftet deutlich am Finger',
                    next: 'Ls',
                },
            ],
        },
        tex2b: {
            id: 'tex2b',
            question: 'Wie verhält sich der Boden weiter?',
            options: [
                {   
                    text: 'sehr sandig (>45%), etwas bindig, schwach formbar, haftet etwas am Finger',
                    next: 'Sl',
                },
                {
                    text: 'sandig (33-50%), etwas bindig, schwach formbar, haftet etwas am Finger',
                    next: 'Slu',
                },
                {
                    text: 'wenig sandig (18-35%), mehlig, etwas bindig, schwach formbar, haftet etwas am Finger',
                    next: 'Uls',
                },
            ],
        },
        tex3a: {
            id: 'tex3a',
            question: 'Der Boden ist mehlig und enthält wenig Sandkörner (<33%)',
            options: [
                {
                    text: 'Ja',
                    next: 'Lu',
                },
                {
                    text: 'Nein',   
                    next: 'tex3'
                },
            ],
        },
        tex3ba: {
            id: 'tex3ba',
            question: 'Wie verhält sich der Boden weiter?',
            options: [
                {
                    text: 'schwach zähplastisch, deutlich Sandkörner (40-75%)',
                    next: 'Ts3-4',
                },
                {   text: 'schwach zähplastisch, Sandkörner kaum sichtbar (<45%)',
                    next: 'Lt',
                },  
                {   text: 'stark zähplastisch, kaum Sandkörner (<20%)',
                    next: 'Tu3-4',
                },
            ],
        },
        tex3bb: {
            id: 'tex3bb',
            question: 'Wie verhält sich der Boden weiter?',
            options: [
                {
                    text: 'Sandkörner deutlcih sicht- und fühlbar (25-60%)',
                    next: 'Lts',
                },
                {   text: 'zähplastisch. Sandkörner sicht- und fühlbar (20-55%)',
                    next: 'Ts2',
                },  
                {   text: 'zähplastisch, kaum Sandkörner (<20%)',
                    next: 'Tu2',
                },
            ],
        },
        tex3bc: {
            id: 'tex3bc',
            question: 'Wie verhält sich der Boden weiter?',
            options: [
                {
                    text: 'zähplastisch, kaum Sandkörner sicht- und fühlbar (5-40%), knirscht zwischen den Zähnen',
                    next: 'Tl',
                },
                {   text: 'zähplastisch, kaum Sandkörner sicht- und fühlbar (<35%), butterartige Konsistenz, mm-dünn ausrollbar',
                    next: 'Tt',
                },  
            ],
        },
        Ss: { id: 'Ss', question: 'Die Bodenart ist', result: {title: 'Ss', description: 'Sandiger Sand'} },
        Su: { id: 'Su', question: 'Die Bodenart ist', result: {title: 'Su', description: 'Schluffiger Sand'} },
        Us: { id: 'Us', question: 'Die Bodenart ist', result: {title: 'Us', description: 'Sandiger Schluff'} },
        Uu: { id: 'Uu', question: 'Die Bodenart ist', result: {title: 'Uu', description: 'Schluffiger Schluff'} },
        Ut: { id: 'Ut', question: 'Die Bodenart ist', result: {title: 'Ut', description: 'Toniger Schluff'} },
        St: { id: 'St', question: 'Die Bodenart ist', result: {title: 'St', description: 'Toniger Sand'} },
        Ls: { id: 'Ls', question: 'Die Bodenart ist', result: {title: 'Ls', description: 'Sandiger Lehm'} },
        Sl: { id: 'Sl', question: 'Die Bodenart ist', result: {title: 'Sl', description: 'Lehmiger Sand'} },
        Slu: { id: 'Slu', question: 'Die Bodenart ist', result: {title: 'Slu', description: 'Schluffiger Lehmiger Sand'} },
        Uls: { id: 'Uls', question: 'Die Bodenart ist', result: {title: 'Uls', description: 'Lehmiger Sandiger Schluff'} },
        Lu: { id: 'Lu', question: 'Die Bodenart ist', result: {title: 'Lu', description: 'Schluffiger Lehm'} },
        'Ts3-4': { id: 'Ts3-4', question: 'Die Bodenart ist', result: {title: 'Ts3-4', description: 'sehr Sandiger Ton'} },
        Lt: { id: 'Lt', question: 'Die Bodenart ist', result: {title: 'Lt', description: 'Toniger Lehm'} },
        'Tu3-4': { id: 'Tu3-4', question: 'Die Bodenart ist', result: {title: 'Tu3-4', description: 'sehr Schluffiger Ton'} },
        Lts: { id: 'Lts', question: 'Die Bodenart ist', result: {title: 'Lts', description: 'Sandiger Toniger Lehm'} },
        Ts2: { id: 'Ts2', question: 'Die Bodenart ist', result: {title: 'Ts2', description: 'Sandiger Ton'} },
        Tu2: { id: 'Tu2', question: 'Die Bodenart ist', result: {title: 'Tu2', description: 'Schluffiger Ton'} },
        Tl: { id: 'Tl', question: 'Die Bodenart ist', result: {title: 'Tl', description: 'Lehmiger Ton'} },
        Tt: { id: 'Tt', question: 'Die Bodenart ist', result: {title: 'Tt', description: 'Toniger Ton'} }
    },
};
