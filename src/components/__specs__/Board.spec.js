import * as Board from '../Board';

import {describe, it} from 'mocha';
import {expect} from 'chai';

describe('Board.splitTextToRowArrays', () => {
  it('should return arr length equal 4', () => {
    const rows = Board.splitTextToRowArrays('abc abc abc abc', 2);
    expect(rows.length).to.equal(4);
  });

  it('should return arr length equal 2', () => {
    const rows = Board.splitTextToRowArrays('abc abc abc abc', 7);
    expect(rows.length).to.equal(2);
  });
});

describe('Board.wordToArray', () => {
  it('should return arr length equal 5', () => {
    const arr = Board.wordToArray('a, b, a');
    console.log(arr);
    expect(arr.length).to.equal(5);
  });
});
