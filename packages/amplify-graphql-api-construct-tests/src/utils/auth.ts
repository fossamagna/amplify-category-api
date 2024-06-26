import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as generator from 'generate-password';

export interface CreateCognitoUserInput {
  region: string;
  userPoolId: string;
}

export interface CreateCognitoUserOutput {
  username: string;
  password: string;
  email: string;
}

/**
 * Creates a new user record and sets a permanent password it
 */
export const createCognitoUser = async (options: CreateCognitoUserInput): Promise<CreateCognitoUserOutput> => {
  const { region, userPoolId } = options;
  const password = generator.generate({
    length: 10,
    lowercase: true,
    numbers: true,
    strict: true,
    symbols: true,
    uppercase: true,
  });

  const username = generator.generate({
    length: 5,
    lowercase: true,
    numbers: false,
    strict: false,
    symbols: false,
    uppercase: false,
  });

  const fakeDomain = generator.generate({
    length: 10,
    lowercase: true,
    numbers: false,
    strict: false,
    symbols: false,
    uppercase: false,
  });
  const email = `${username}+TEST@${fakeDomain}.test`;

  const client = new CognitoIdentityProviderClient({ region });

  const signUpCommand = new AdminCreateUserCommand({
    UserPoolId: userPoolId,
    Username: username,
    MessageAction: 'SUPPRESS',
    TemporaryPassword: password,
    UserAttributes: [{ Name: 'email', Value: email }],
  });
  await client.send(signUpCommand);

  const setPasswordCommand = new AdminSetUserPasswordCommand({
    UserPoolId: userPoolId,
    Username: username,
    Password: password,
    Permanent: true,
  });
  await client.send(setPasswordCommand);

  return {
    username,
    password,
    email,
  };
};

export interface SignInCognitoUserInput {
  password: string;
  region: string;
  username: string;
  userPoolClientId: string;
}

export interface SignInCognitoUserOutput {
  accessToken: string;
  idToken: string;
  username: string;
}

export const signInCognitoUser = async (options: SignInCognitoUserInput): Promise<SignInCognitoUserOutput> => {
  const { password, region, username, userPoolClientId } = options;
  const client = new CognitoIdentityProviderClient({ region });

  const initiateAuthCommand = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: userPoolClientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  });
  const signInResult = await client.send(initiateAuthCommand);

  const { AuthenticationResult: authResult } = signInResult;
  if (!authResult) {
    throw new Error(`AuthenticationResult unexpectedly null. Received signInResult: ${signInResult}`);
  }

  return {
    accessToken: authResult.AccessToken!,
    idToken: authResult.IdToken!,
    username,
  };
};
