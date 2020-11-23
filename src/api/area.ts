import request from '@/utils/request'

export const getAreas = () =>
  request({
    url: '/area',
    method: 'get'
  })

export const saveAreas = (data: any) =>
  request({
    url: '/saveArea',
    method: 'post',
    data
  })
