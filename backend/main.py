from work_app import app

import os

os.chdir(os.path.split(os.path.realpath(__file__))[0])



if __name__ == "__main__":
    app.run('0.0.0.0', 5566, debug=True)

