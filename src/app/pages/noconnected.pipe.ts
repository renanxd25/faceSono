import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noconnected',
  standalone: true
})
export class NoconnectedPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
