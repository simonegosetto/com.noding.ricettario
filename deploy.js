const MvlPipelineDeploy = require('@myvirtualab.deploy/pipeline');

const myDeploy = new MvlPipelineDeploy({
  applicationName: 'ricettario', // Nome Applicazione che viene usato per comporre il nome del file di backup (insieme alla data e ora)
  isProduction: process.argv.includes('--prod'), // flag che identifica l'ambiente (produzione o test)
  direct: process.argv.includes('--direct'), // flag che indica se skippare il backup del target o meno
  preSSHCommands: [], // comandi da lanciare in ssh sul target PRIMA del deploy dei file es: {command: 'ls -l', cwd: ''},
  src: { // file o cartelle locali
    path: './platforms/browser/www', // path di sorgente dei file compilati
    notUploadEtc: [] // file o cartelle (path completa con \) da non caricare sul target es: 'dist\\index.css'
  },
  backup: {
    locale: './backup', // path locale dove lo script scaricherà i file in modo temporaneo (una volta che vengono buttati sul server vanno cancellati)
    notBackupEtc: [], // file o cartelle remote (path completa con la /) da non backuppare es: '/var/www/html/test2.loonar.it/BackEnd'
    databases: [
      {
        host: 'U2FsdGVkX1/XiwzBAUvuQLxyiYLD5cHG+zPkS8dgwsQ=',
        port: 3306,
        user: 'U2FsdGVkX1/jTNXOTiHjwI8CdLr5C6tL7Sz4Pm0nFH8=',
        password: 'U2FsdGVkX18pa01YRAyI8Mmn/o1/ZH0gOz5iP+d3Vhg0hv6E/6i9Q0Ft+F6s+DG9',
        database: 'ext_ricettario'
      }
    ],
    remotes: [
      { // è un array perchè posso avere più server dove buttare il backup
        connection: { // connessione SFTP al server di backup
          host: '93.39.181.163',// '192.168.2.118',
          port: '222', // '22',
          username: 'backup',
          password: 'backup',
        },
        path: '/share/HDC_DATA/DISCO 3/Backup/MyVirtuaLab' // path remota del server di backup dove spostare i file
      },
    ]
  },
  target: { // si riferisce al server di test o produzione su cui fare il deploy
    connection: { // connessioni SFTP ai server di test o produzione
      env: {
        test: {
          host: '192.168.121.52',
          port: '22',
          username: 'root',
          password: 'ubuntu',
        },
        prod: { // NB il server di Produzione ha i parametri cryptati perchè solo Simone ha gli accessi per fare il deploy
          host: 'U2FsdGVkX18xkY7CIJ1OeYtNdxalgDyq0P4qpYu1/s0=',
          port: '22',
          username: 'U2FsdGVkX1+1rh81UyHEMucD6i9KLFXvp6F3unJgO+Y=',
          password: 'U2FsdGVkX1/Jvf996E7lEuiDFV86AI2tjy9aP7MyIKs='
        }
      }
    },
    path: {
      env: {
        test: '/var/www/html/xxx', // path su cui fare il deploy sul server di test
        prod: '/var/www/html/ricettario' // path su cui fare il deploy sul server di produzione
      },
    },
    notDeleteEtc: ['BackEnd', '.htaccess', 'Upload'] // file o cartelle da NON cancellare sul server dove facciamo il deploy
  },
  postSSHCommands: [], // comandi da lanciare in ssh sul target DOPO il deploy dei file es: {command: 'ls -l', cwd: '/var/www/html/test2.loonar.it'},
});

myDeploy.run().then();
