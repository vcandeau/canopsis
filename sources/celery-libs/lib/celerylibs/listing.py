import os
from caccount import caccount
from cstorage import cstorage
from datetime import timedelta
from celery.schedules import crontab

def tasks(path):
    dirList=os.listdir(path)
    list_tasks = []
    for mfile in dirList:
        ext = mfile.split(".")[1]
        name = mfile.split(".")[0]
        if name != "." and ext == "py" and name != '__init__':
            list_tasks.append(name)
    return tuple(list_tasks)

def crons():
    account = caccount(user='root', group='root')
    storage = cstorage(account, namespace='object')
    records = storage.find({"crecord_type": "schedule"})
    schedules = {}
    for record in records:
        schedule = {}
        schedule['task'] = record.data['task']
        if record.data.has_key('args'):
            schedule['args'] = record.data['args']
        if record.data.has_key('kwargs'):
            schedule['kwargs'] = record.data['kwargs']

        if record.data.has_key('timedelta'):
            if record.data['timedelta'] != None:
                ret_timedelta = timedelta(**record.data['timedelta'])
                schedule['schedule'] = ret_timedelta
        if record.data.has_key('crontab'):
            if record.data['crontab'] != None:
                ret_crontab = crontab(**record.data['crontab'])
                schedule['schedule'] = ret_crontab

        schedules[record.data['name']] = schedule

    return schedules
