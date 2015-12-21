--DDD D'Arc the Oracle Overlord
function c13790537.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcFunRep(c,aux.FilterBoolFunction(Card.IsSetCard,0xaf),2,true)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EFFECT_REVERSE_DAMAGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(1,0)
	e1:SetValue(c13790537.rev)
	c:RegisterEffect(e1)
end
function c13790537.rev(e,re,r,rp,rc)
	return bit.band(r,REASON_EFFECT)>0
end
