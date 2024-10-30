import MasterThread from "./utils/thread.js";
import { ThreadRenderingMsg as Msg, TypeConstructor, Type } from "./core/enums.js";
/**@import {GPUApp, GPUCompilableProgram, GPUProgram, LifecycleFunctions, VertexTransferable} from "./core/type.d.ts" */
/**@import Scene from "./core/scene.js" */



/**
 * @implements {GPUApp}
 */
export default class Game {
      /**
       * @type {MasterThread}
       */
      #thread;

      /**
       * @type {HTMLCanvasElement}
       */
      #cvs;

      /**
       * @type {boolean}
       */
      #isReady = false;

      /**
       * @type {{ 
       * method: 'draw' | 'stop' | 'create' | 'addToScene' | 'removeFromScene' | 'update' | 'startGame' | 'createGlobalBuffer' | 'writeGlobalBuffer' | 'createCamera' | 'moveCamera' | 'freeEntity', args: Array<any> }[]}
       */
      #waitingQueue = [];

      /**
       * @type {Map<string,Scene>}
       */
      #scenes = new Map();

      /**
       * @type {Scene}
       */
      #currentScene;

      /**
       * @type {Boolean}
       */
      #isSceneReady = false;

      /**
       * @type {Object.<string,any>}
       */
      store;

      get canvasWidth() {
            return this.#cvs.clientWidth;
      }

      get canvasHeight() {
            return this.#cvs.clientHeight;
      }

      constructor( root = document.body ) {
            this.#cvs = document.createElement( 'canvas' );
            root.appendChild( this.#cvs );
            this.#cvs.width = parseFloat(root.style.width) || window.innerWidth;
            this.#cvs.height = parseFloat(root.style.height) || window.innerHeight;

            
            const offscreen = this.#cvs.transferControlToOffscreen();

            //@ts-ignore
            this.#thread = new MasterThread( import.meta.resolve('./core/render-thread.js') );

            this.#thread.waitFor( Msg.ready ).then( ()=>{
                  
                  this.#thread.sendMessage( Msg.canvasPassed, {
                        canvas: offscreen,
                  }, [offscreen] );
                  
                  this.#thread.waitFor( Msg.ready ).then( ()=>{
                        this.#isReady = true;
                        this.#waitingQueue.forEach( descriptor => {
                              //@ts-ignore
                              this[descriptor.method]( ...descriptor.args );
                        });
                        this.#waitingQueue = [];
                  });
            });
      }
      /**
       * primitive used to instantiate new entities that can be rendered on the gpu.
       * ## USAGE
       * @example
       * ```javascript
      game.create('triangle', {
                  code: `
                              struct Vertex {
                                    ＠location(0) position: vec2f,
                                    ＠location(1) color: vec3f,
                              };
      
                              struct VSOutput {
                                    ＠builtin(position) position: vec4f,
                                    ＠location(0) color: vec4f,
                              };
      
                              ＠vertex fn vs(
                              vert: Vertex,
                              ) -> VSOutput {
                                    var vsOut: VSOutput;
                                    vsOut.position = vec4f(vert.position, 0.0, 1.0);
                                    vsOut.color = vec4f( vert.color, 1.0 );
                                    return vsOut;     
                              }
      
                              ＠fragment fn fs(vsOut: VSOutput) -> ＠location(0) vec4f {
                                    return vsOut.color;
                              }
                        `,
                  vertexDescriptor: [{
                        location: 0,
                        type: Float32Array,
                        size: 2,
                        values: [ 
                              0, 0, 
                              1, 0, 
                              0, 1,
                              1, 1,
                        ],
                  },{
                        location: 1,
                        type: Float32Array,
                        size: 3,
                        values: [ 
                              1, 0, 0, 
                              0, 1, 0, 
                              0, 0, 1,
                              1, 0, 1,
                        ],
                  }],
                  groups: [],
                  indices: [ 0, 1, 2, 1,2,3 ],
                  topology: null,
                  cullMode: 'none',
                  vertexEntryPoint: "vs",
                  fragmentEntryPoint: "fs",
            });
      })
       * ```
       * ## FAILURE
       * 
       * it may fail in some cases, such as: 
       * - the arguments of program aren't legal;
       * - the id used is already in use;
       * 
       * @param {string} id 
       * @param {GPUProgram} program 
       */
      create(id, program) {
            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'create',
                        args: [ id, program ]
                  });
                  return;
            }
            const buffers = [];
            const v = program.vertexDescriptor;
            /**
             * @type {VertexTransferable[]}
             */
            const vertex = [];

            for( let i = 0; i < v.length; i++ ){
                  vertex.push({
                        ...v[i],
                        values: new TypeConstructor[ v[i].type ]( v[i].values ).buffer,
                  });
                  buffers.push( vertex[i].values );
            }
            this.#thread.sendMessage( Msg.createEntity, {
                  id,
                  program: {
                        ...program,
                        vertexDescriptor: vertex,
                  },
            }, buffers);
            return this;
      }
      /**
       * 
       * @param {string} id 
       */
      addToScene( id ) {
            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'addToScene',
                        args: [ id ]
                  });
                  return;
            }
            this.#thread.sendMessage( Msg.addToScene, {
                  id
            });
            return this;
      }

      draw() {
            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'draw',
                        args: [],
                  });
                  return;
            }

            this.#thread.sendMessage( Msg.draw, {});
            return this;
      }
      stop() {
            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'stop',
                        args: []
                  });
                  return;
            }
            this.#thread.sendMessage( Msg.stop, {});
            return this;
      }
      /**
       * 
       * @param {string} id 
       */
      removeFromScene(id) {
            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'removeFromScene',
                        args: [ id, ]
                  });
                  return;
            }
            this.#thread.sendMessage( Msg.removeFromScene, {
                  id
            });
            return this;
      }
      /**
       * 
       * @param {string} id 
       */
      freeEntity( id ) {
            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'freeEntity',
                        args: [ id, ]
                  });
                  return;
            }
            this.#thread.sendMessage( Msg.freeEntity, {
                  id
            });
            return this;
      }
      /**
       * @ignore
       * @param {string} id 
       * @param {number} group 
       * @param {number} binding 
       * @param {number[] | string} resource 
       * @param {number} z 
       */
      update(id, group, binding, resource, z) {
            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'update',
                        args: [ id, group, binding, resource, z ]
                  });
                  return;
            }
            this.#thread.sendMessage( Msg.updateEntity, {
                  id,
                  group,
                  binding,
                  resource,
                  z,
            });
            return this;
      }

      
      startGame(){

            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'startGame',
                        args: [],
                  });
                  return;
            }

            this.#currentScene && this.#currentScene.onEnter( this );

            this.draw();

            const gameLoop = ()=>{
                  this.#isSceneReady && this.#currentScene.onUpdate( this );
                  requestAnimationFrame( gameLoop );
            };

            gameLoop();
            return this;
      }

      /**
       * 
       * @param {typeof Scene} Scene 
       */
      changeScene( Scene ){

            this.#isSceneReady = false;

            let scene = this.#scenes.get( Scene.name );

            if( !scene ){

                  scene = new Scene( this );
                  this.#scenes.set( Scene.name, scene );

            }else {
                  scene.__draw__();
            }

            if( this.#currentScene ){
                  this.#currentScene.onLeave( this );
                  this.#currentScene.__stopDrawing__();
            }

            scene.onEnter( this );

            this.#currentScene = scene;

            this.#isSceneReady = true ;
      }

      /**
       * 
       * @param {string} bufferId 
       * @param {Type | null} type
       * @param {number} size 
       */
      createGlobalBuffer( bufferId, type, size ){

            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'createGlobalBuffer',
                        args: [ bufferId, type, size ],
                  });
                  return;
            }

            this.#thread.sendMessage( Msg.createGlobal, {
                  bufferId,
                  type,
                  size,
            });
      }
      
      /**
       * 
       * @param {string} bufferId 
       * @param {number} byteOffset 
       * @param {Type} type
       * @param {number[]} values 
       */
      writeGlobalBuffer( bufferId, byteOffset, type, values ){

            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'writeGlobalBuffer',
                        args: [ bufferId, byteOffset, type, values ],
                  });
                  return;
            }

            const buffer =  new TypeConstructor[ type ]( values ).buffer;
            
            this.#thread.sendMessage( Msg.writeGlobal, {
                  bufferId,
                  type,
                  byteOffset,
                  values: buffer,
            }, [buffer] );
      }

      /**
       * @param {number} sceneId 
       * @param {number} cameraId 
       * @param {number[]} values 
       */
      createCamera( sceneId, cameraId, values ){
            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'createCamera',
                        args: [ sceneId, cameraId, values ],
                  });
                  return;
            }

            const buffer =  new Float32Array( values ).buffer;
            
            this.#thread.sendMessage( Msg.createCamera, {
                  sceneId,
                  cameraId,
                  values: buffer,
            }, [buffer] );
      }

      /**
       * @param {number} sceneId 
       * @param {number} cameraId 
       * @param {number[]} values 
       */
      moveCamera( sceneId, cameraId, values ){

            if( !this.#isReady ){
                  this.#waitingQueue.push({
                        method: 'moveCamera',
                        args: [ sceneId, cameraId, values ],
                  });
                  return;
            }

            const buffer =  new Float32Array( values ).buffer;
            
            this.#thread.sendMessage( Msg.updateCamera, {
                  sceneId,
                  cameraId,
                  values: buffer,
            }, [buffer] );
      }
}