import { NoconnectedPipe } from './noconnected.pipe';

describe('NoconnectedPipe', () => {
  it('create an instance', () => {
    const pipe = new NoconnectedPipe();
    expect(pipe).toBeTruthy();
  });
});
