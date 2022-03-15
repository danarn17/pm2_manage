import pm2,{Proc,ProcessDescription,StartOptions} from 'pm2'
import {promisify} from 'util';

class pm2Lib{
    private readonly SCRIPT_PATH=process.env.SCRIPT_PATH;
    private readonly MINERS=['miner01.js','miner02.js'];

    async getProcesses():Promise<ProcessDescription[]>{
        const processes:ProcessDescription[]=[];
        for(const srv of await promisify(pm2.list).call(pm2)){
                const nm:string=srv.name as string;
                
                const [proc]=await promisify(pm2.describe).call(pm2,nm);
                if(proc){
                    processes.push(proc);
                }else{
                    processes.push({
                        name:nm,
                        pm2_env:{
                            status:'stopped',
                        }
                    });
                }

        }

        // for(const miner of this.MINERS){
        //     const [proc]=await promisify(pm2.describe).call(pm2,miner);
        //     console.log(miner);

        //     if(proc){
        //         processes.push(proc);
        //     }else{
        //         processes.push({
        //             name:miner,
        //             pm2_env:{
        //                 status:'stopped',
        //             }
        //         });
        //     }
        // }

        return processes;
    }

    async startProcess(filename:string):Promise<Proc>{
        const proc =this.getStartOptions(filename);

        return promisify<StartOptions,Proc>(pm2.start).call(pm2,proc);
    }
    async restartProcess(filename:string):Promise<Proc> {
        return promisify(pm2.restart).call(pm2,filename);
    }
    async stopProcess(filename: string): Promise<Proc> {
    return promisify(pm2.stop).call(pm2, filename);
    }
    private getStartOptions(filename: string): StartOptions {
        const alias = filename.replace('.js', '');
        return {
            script: `${filename}`,
            name: filename,
            log_date_format: 'YYYY-MM-DD HH:mm Z',
            output: `${alias}.stdout.log`,
            error: `${alias}.stderr.log`,
            exec_mode: 'fork',
        };
    }
}

export default new pm2Lib();