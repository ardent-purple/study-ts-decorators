// декоратор -- это просто функция с определенной сигнатурой
// сигнатура строго зависит от того, что мы декорируем: класс, метод, поле, аксессор или же параметры
// это декоратор класса. Он берет конструктор и ограничивает его применение -- делает недоступным извне
// иначе говоря, декорированный таким образом класс превращается в финальный
function Final(constructor: Function) {
  Object.freeze(constructor)
  Object.freeze(constructor.prototype)
}

@Final // declarative nature of decorators
class IceCream {
  constructor(
    public flavour: string
  ) {}
}

console.log(Object.isFrozen(IceCream)) // true
console.log(Object.isFrozen(IceCream.prototype)) // true
const cherryTop = new IceCream('cherry')
console.log(Object.isFrozen(cherryTop)) // false

cherryTop.flavour = 'nougat' // writable and readable still
console.log(cherryTop.flavour) 

// TypeError: Cannot assign to read only property 'constructor' of object '#<IceCream>'
// class FroYo extends IceCream {  }

// Зачастую нужно делать декораторы в "Фабриках декораторов", чтобы настраивать их более гибко
// пример -- декорирование поля, при установке в которое, будем оборачивать его в эмодзи

// decorator factory
function Emojify(emoji: string) {
  return function(target: any, key: string | symbol) {
    let val = target[key]

    const getter = () => {
      return val 
    }

    const setter = (next: string) => {
      console.log(`updating ${String(key)}`);
      val = `${emoji} ${next} ${emoji}`
    }
    console.log(target);
    console.log(key);
    console.log(val);
    
    
    
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    })
  }
}

class Message {
  @Emojify('⚠')
  public content: string

  constructor (content: string) {
    this.content = content
  }
}

class Soldier {
  @Emojify('💂')
  public order: string

  constructor (order: string) {
    this.order = order
  }
}

const message = new Message('we all gonna die')
const soldier = new Soldier('yeah')
console.log(message);
console.log(soldier);
console.log(message.content);
console.log(soldier.order);

// декоратор методов
// Делает метод асинхронным с задержкой
function Delay(ms: number) {
  return function(
    target: any, // конструктор для статического метода, class.prototype для метода экземпляра
    key: string | symbol, // ключ 
    descriptor: PropertyDescriptor // дескриптор свойства, value содержит саму исходную функцию (метод)
    ) {
      const fn = descriptor.value;

      descriptor.value = function (...args: any[]) {
        setTimeout(() => fn.apply(this, args), ms)
      }

      return descriptor
    }
}

class Car {
  beep() {
    console.log('beep beep!')
  }
}

class SlowCar extends Car {
  @Delay(1000) 
  beep() {
    console.log('errmmmmm... ah, yeah...')
    super.beep()
  }
}

class SlowestCar extends Car {
  @Delay(1000)
  @Delay(2000) // композиция декораторов, оборачиваются один за другим
  beep() {
    console.log('ohhhhhhhhhhhhhhhhhh........')
    super.beep()
  }
}

const car = new Car()
const slowCar = new SlowCar()
const slowestCar = new SlowestCar()
slowestCar.beep()
slowCar.beep()
car.beep()