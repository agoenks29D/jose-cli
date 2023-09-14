#! /usr/bin/env node
import fs from 'fs/promises';
import chalk from 'chalk';
import { Command } from 'commander';
import select, { Separator } from '@inquirer/select';
import input from '@inquirer/input';
import {
  generateSecret,
  generateKeyPair,
  exportSPKI,
  exportPKCS8,
  exportJWK,
} from 'jose';

enum SecretAlgo {
  HS256 = 'HS256',
  HS384 = 'HS384',
  HS512 = 'HS512',
  A128CBC_HS256 = 'A128CBC-HS256',
  A192CBC_HS384 = 'A192CBC-HS384',
  A256CBC_HS512 = 'A256CBC-HS512',
  A128KW = 'A128KW',
  A192KW = 'A192KW',
  A256KW = 'A256KW',
  A128GCMKW = 'A128GCMKW',
  A192GCMKW = 'A192GCMKW',
  A256GCMKW = 'A256GCMKW',
  A128GCM = 'A128GCM',
  A192GCM = 'A192GCM',
  A256GCM = 'A256GCM',
}

enum KeyPairAlgo {
  EdDSA = 'EdDSA',
  ES256 = 'ES256',
  ES256K = 'ES256K',
  ES384 = 'ES384',
  ES512 = 'ES512',
  PS256 = 'PS256',
  PS384 = 'PS384',
  PS512 = 'PS512',
  RS256 = 'RS256',
  RS384 = 'RS384',
  RS512 = 'RS512',
  RSA_OAEP = 'RSA-OAEP',
  RSA_OAEP_256 = 'RSA-OAEP-256',
  RSA_OAEP_384 = 'RSA-OAEP-384',
  RSA_OAEP_512 = 'RSA-OAEP-512',
  RSA1_5 = 'RSA1_5',
  ECDH_ES = 'ECDH-ES',
  ECDH_ES_A128KW = 'ECDH-ES+A128KW',
  ECDH_ES_A256KW = 'ECDH-ES+A256KW',
}
const secretAlgo: SecretAlgo[] = Object.values(SecretAlgo);
const keyPairAlgo: KeyPairAlgo[] = Object.values(KeyPairAlgo);

type SecretCommandOptions = {
  save?: boolean | string;
};

type KeyPairCommandOptions = {
  jwk?: boolean | string;
  save?: boolean | string;
};

const program = new Command();

program.name('jose').version('1.0.0').usage('[command] [options]');

/**
 * * Generate secret
 */
program
  .command('generate:secret')
  .alias('secret')
  .usage('[algorithm] [options]')
  .description(
    'Generates a symmetric secret key for a given JWA algorithm identifier.',
  )
  .argument(
    '[algorithm]',
    'JWA Algorithm Identifier to be used with the generated secret.',
  )
  .option('-s, --save [filename]', 'Save to file', false)
  .action(async (algorithm: SecretAlgo, options: SecretCommandOptions) => {
    if (!secretAlgo.includes(algorithm)) {
      algorithm = await select({
        message: 'Choose algorithm',
        choices: [
          ...secretAlgo.map((alg) => ({
            name: alg,
            value: alg,
          })),
          new Separator(),
        ],
        pageSize: secretAlgo.length,
      });

      const secretKey = await generateSecret(algorithm);
      const exportedKey = await exportJWK(secretKey);

      // Save as name
      let fileName = options.save;

      // * Custom file name
      if (options.save === true) {
        fileName = await input({
          message: 'File name :',
        });
      }

      const exportFile = `${process.cwd()}/${fileName}.json`;

      if (options.save) {
        fs.writeFile(exportFile, JSON.stringify(exportedKey, null, 2)).then(
          () => {
            console.log(exportedKey);
            console.log(`${chalk.yellow(`Exported to : ${exportFile}`)}\n`);
          },
          () => {
            program.error(`${chalk.red('Unable to export key')}`);
          },
        );
      }

      if (!options.save) {
        console.log(exportedKey);
      }
    }
  });

/**
 * * Generate key pair
 */
program
  .command('generate:keypair')
  .alias('keypair')
  .usage('[algorithm] [options]')
  .description(
    'Generates a private and a public key for a given JWA algorithm identifier.',
  )
  .argument(
    '[algorithm]',
    'JWA Algorithm Identifier to be used with the generated key pair.',
  )
  .option('-j, --jwk [filename]', 'Export JWK', false)
  .option('-s, --save [filename]', 'Save to file', false)
  .action(async (algorithm: KeyPairAlgo, options: KeyPairCommandOptions) => {
    if (!keyPairAlgo.includes(algorithm)) {
      algorithm = await select({
        message: 'Choose algorithm',
        choices: [
          ...keyPairAlgo.map((alg) => ({
            name: alg,
            value: alg,
          })),
          new Separator(),
        ],
        pageSize: keyPairAlgo.length,
      });
    }

    // Generated key pair
    const { publicKey, privateKey } = await generateKeyPair(algorithm);

    // Export PEM
    const exportPublicKey = await exportSPKI(publicKey);
    const exportPrivateKey = await exportPKCS8(privateKey);

    // Export JWK
    const jwkPublicKey = await exportJWK(publicKey);
    const jwkPrivatekey = await exportJWK(privateKey);

    // Save as name
    let fileName = options.save;

    // * Custom file name
    if (options.save === true) {
      fileName = await input({
        message: 'File name :',
      });
    }

    // Export file
    const exportFile = {
      pemPublicFile: `${process.cwd()}/Public${fileName}.pem`,
      pemPrivateFile: `${process.cwd()}/Private${fileName}.pem`,
      jwkPublicFile: `${process.cwd()}/${
        options.jwk === true ? fileName : options.jwk
      }public.json`,
      jwkPrivateFile: `${process.cwd()}/${
        options.jwk === true ? fileName : options.jwk
      }private.json`,
    };

    // ? Save option
    if (options.save) {
      // * Save public key
      fs.writeFile(exportFile.pemPublicFile, exportPublicKey).then(
        () => {
          console.log(exportPublicKey);
          console.log(
            `${chalk.green(`Exported to : ${exportFile.pemPublicFile}`)}\n`,
          );
        },
        () => {
          program.error(`${chalk.red('Unable to export key')}`);
        },
      );

      // * Save private key
      fs.writeFile(exportFile.pemPrivateFile, exportPrivateKey).then(
        () => {
          console.log(exportPrivateKey);
          console.log(
            `${chalk.yellow(`Exported to : ${exportFile.pemPrivateFile}`)}\n`,
          );
        },
        () => {
          program.error(`${chalk.red('Unable to export key')}`);
        },
      );

      // ? Export JWK
      if (options.jwk) {
        // * Save JWK public key
        fs.writeFile(
          exportFile.jwkPublicFile,
          JSON.stringify(jwkPublicKey, null, 2),
        ).then(
          () => {
            console.log(jwkPublicKey);
            console.log(
              `${chalk.green(`Exported to : ${exportFile.jwkPublicFile}`)}\n`,
            );
          },
          () => {
            program.error(`${chalk.red('Unable to export key')}`);
          },
        );

        // * Save JWK private key
        fs.writeFile(
          exportFile.jwkPrivateFile,
          JSON.stringify(jwkPrivatekey, null, 2),
        ).then(
          () => {
            console.log(jwkPrivatekey);
            console.log(
              `${chalk.yellow(`Exported to : ${exportFile.jwkPrivateFile}`)}\n`,
            );
          },
          () => {
            program.error(`${chalk.red('Unable to export key')}`);
          },
        );
      }
    }

    // ? Save option : false
    if (!options.save) {
      console.log(exportPublicKey);
      console.log(exportPrivateKey);

      if (options.jwk) {
        console.log(`${chalk.green('JWK public key:')}`);
        console.log(jwkPublicKey);
        console.log(`${chalk.yellow('JWK private key:')}`);
        console.log(jwkPrivatekey);
      }
    }
  });

program.parse(process.argv);
