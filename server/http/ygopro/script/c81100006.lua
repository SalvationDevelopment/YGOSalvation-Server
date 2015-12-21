--氷帝家臣エッシャー
function c81100006.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c81100006.hspcon)
	c:RegisterEffect(e1)
end
function c81100006.hspcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	local g=Duel.GetFieldGroup(tp,0,LOCATION_SZONE)
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
	and g:GetCount()>=2
end
