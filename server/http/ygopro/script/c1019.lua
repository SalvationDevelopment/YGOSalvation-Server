--機械王－プロトタイプ
function c1019.initial_effect(c)
	--atkup
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetRange(LOCATION_MZONE)
	e1:SetValue(c1019.val)
	c:RegisterEffect(e1)
	--defup
	local e2=e1:Clone()
	e2:SetCode(EFFECT_UPDATE_DEFENCE)
	c:RegisterEffect(e2)
end
function c1019.val(e,c)
	return Duel.GetMatchingGroupCount(c1019.filter,c:GetControler(),LOCATION_MZONE,LOCATION_MZONE,e:GetHandler())*100
end
function c1019.filter(c)
	return c:IsFaceup()
end
