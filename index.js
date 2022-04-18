#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const ini = require('ini');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

(async () => {
  const [tokenCode] = process.argv.slice(2);

  if (tokenCode) {
    const cfg = ini.parse(await fs.readFile(path.join(__dirname, '/config'), 'utf-8'));
    const credsPath = path.join(process.env.HOME, '/.aws/credentials');
    const creds = ini.parse(await fs.readFile(credsPath, 'utf-8'));

    const { Credentials: tokenCreds } = await getSessionToken(cfg, tokenCode);
    creds[cfg.tokenProfile] = mapCredsKeys(creds[cfg.tokenProfile], tokenCreds);
    await fs.writeFile(credsPath, ini.encode(creds));

    const { Credentials: roleCreds, AssumedRoleUser } = await assumeRole(cfg);
    creds[cfg.roleProfile] = mapCredsKeys(creds[cfg.roleProfile], roleCreds);
    await fs.writeFile(credsPath, ini.encode(creds));

    console.log('\nDONE:', 'Assumed role', AssumedRoleUser.AssumedRoleId);
  } else {
    console.log('\nERROR:', 'Please provide an Authenticator app code');
  }
})();

async function getSessionToken(cfg, tokenCode) {
  try {
    const duration = cfg.durationSeconds ?? '3600';
    const cmd = `aws sts get-session-token --profile ${cfg.userProfile} --serial-number ${cfg.tokenSerial} --token-code ${tokenCode} --duration-seconds ${duration}`;
    const { stdout } = await exec(cmd);
    return JSON.parse(stdout);
  } catch (err) {
    console.log('\nERROR:', err.stderr.trim(), '\n');
  }
}

async function assumeRole(cfg) {
  try {
    const cmd = `aws sts assume-role --profile ${cfg.tokenProfile} --role-arn ${cfg.roleArn} --role-session-name ${cfg.roleSessionName}`;
    const { stdout } = await exec(cmd);
    return JSON.parse(stdout);
  } catch (err) {
    console.log('\nERROR:', err.stderr.trim(), '\n');
  }
}

function mapCredsKeys(prev, next) {
  return {
    ...prev,
    aws_access_key_id: next.AccessKeyId,
    aws_secret_access_key: next.SecretAccessKey,
    aws_session_token: next.SessionToken,
  };
}
