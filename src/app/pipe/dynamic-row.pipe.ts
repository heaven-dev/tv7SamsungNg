import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamicRow'
})
export class DynamicRowPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return value[args[0]];
  }
}
