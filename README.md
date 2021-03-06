# Simple Class resolver

## Getting started

```
$ npm i -S class-resolver
```

## Example code
```
const Resolver = require('class-resolver')

class ExampleClass {
  supports(type) {
    return type === 'hoge'
  }
  handle() {
    return 'hoge'
  }
}
class ExampleClass2 {
  supports(type) {
    return type === 'fuga'
  }
  handle() {
    return 'fuga'
  }
}
console.log(Resolver)
const resolver = new Resolver(new ExampleClass(), new ExampleClass2())
const c = resolver.resolve('hoge')
console.log(c.handle())
const c2 = resolver.resolve('fuga')
console.log(c2.handle())

try {
  resolver.resolve('xxx')
} catch (e) {
  console.log(e)
}
```

Execute result

```
$ node index.js
hoge
fuga
Error: Unsupported type: xxx
```

## Contributing

```
$ npm install
$ git checkout -b YOUR_TOPIC_BRANCH
$ npm test
$ npm run build
$ git add ./
$ git commit -m "YOUR UPDATE DESCRIPTION"
$ git push YOUR_ORIGIN YOUR_TOPIC_BRANCH
```