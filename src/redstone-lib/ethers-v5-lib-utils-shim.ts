/* eslint-disable no-extend-native */
import {
  AbiCoder,
  decodeBase64,
  decodeBytes32String,
  encodeBase64,
  encodeBytes32String,
  getBytes,
  hexlify,
  isBytesLike,
  Signature,
  SigningKey,
  toBeHex,
} from "ethers";

export const arrayify = getBytes;
export const defaultAbiCoder = AbiCoder.defaultAbiCoder();
export const base64 = { encode: encodeBase64, decode: decodeBase64 };
export const formatBytes32String = encodeBytes32String;
export const parseBytes32String = decodeBytes32String;

export const splitSignature = (sig: any) => {
  if (isBytesLike(sig)) {
    return Signature.from(hexlify(sig));
  }
  return Signature.from(sig);
};
export const joinSignature = (sig: any) => Signature.from(sig).serialized;

function addSlice(array: Uint8Array): Uint8Array {
  if (array.slice) {
    return array;
  }

  array.slice = function () {
    const args = Array.prototype.slice.call(arguments);
    return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
  };

  return array;
}

export function concat(items: ReadonlyArray<any>): Uint8Array {
  const objects = items.map(item => arrayify(item));
  const length = objects.reduce((accum, item) => accum + item.length, 0);

  const result = new Uint8Array(length);

  objects.reduce((offset, object) => {
    result.set(object, offset);
    return offset + object.length;
  }, 0);

  return addSlice(result);
}

export function zeroPad(value: any, length: number): Uint8Array {
  // eslint-disable-next-line no-param-reassign
  value = arrayify(value);

  if (value.length > length) {
    throw new Error("value out of range");
  }

  const result = new Uint8Array(length);
  result.set(value, length - value.length);
  return addSlice(result);
}

export function recoverPublicKey(digest: any, signature: any): string {
  return SigningKey.recoverPublicKey(digest, signature);
}

export {
  computeAddress,
  hexlify,
  isHexString,
  keccak256,
  parseUnits,
  sha256,
  SigningKey,
  toUtf8Bytes,
  toUtf8String,
  verifyMessage,
} from "ethers";

// @ts-ignore
BigInt.prototype.toHexString = function () {
  return toBeHex(this);
};
