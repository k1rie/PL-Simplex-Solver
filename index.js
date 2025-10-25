import express from 'express';
import GLPK from 'glpk.js';
import cors from 'cors';
const app = express();
const glpk = GLPK();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});



app.use(express.json());
app.use(cors());




app.post('/getMaximization', (req, res) => {
    const regex = /obj\s*=\s*([-\d.e+]+)/i;

    const options = {
        msglev: glpk.GLP_MSG_ALL,
        presol: false,
        cb: {
            call: progress => console.log(progress),
            each: 1
        }
    };

    let glpkIterations = null;
    process.stdout.write = (chunk, encoding, callback) => {
        glpkIterations += chunk.toString();
        if (callback) callback();
        return true;
    };

    const result = glpk.solve({
        name: 'LP',
        objective: {
            direction: glpk.GLP_MAX,
            name: 'obj',
            vars: req.body.objective
        },
        subjectTo: req.body.constraints
    }, options);

    process.stdout.write = process.stdout.write;;

    const zArray = glpkIterations
  .split('\n')
  .map(line => line.match(regex))
  .filter(match => match)
  .map(match => parseFloat(match[1]));

    console.log('GLPK Result:', result);
    console.log('GLPK Iterations:', glpkIterations);
    res.json({
        message: 'Optimization completed',
        result: result,
        iterations: zArray
    });
});
