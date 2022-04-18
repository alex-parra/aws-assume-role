# aws-assume-role

## Set up
1. clone repo and run `npm i`
2. duplicate `config.sample` and name it `config`
3. fill config values:
  - userProfile: `~/.aws/credentials` profile to use for login
  - tokenProfile: `~/.aws/credentials` profile to use for token session
  - roleProfile: `~/.aws/credentials` profile to use for assumed role session
  - tokenSerial: arn of user
  - roleArn: arn of role to assume
  - roleSessionName: session name
  - durationSeconds: assume role expiry
4. run `npm run assume-role 999999`
