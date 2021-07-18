import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'itemCount'
})
export class ItemCountPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return value.length;
  }
}
