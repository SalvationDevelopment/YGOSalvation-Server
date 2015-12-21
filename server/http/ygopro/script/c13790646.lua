--Red Dragon Archfiend Scarright
function c13790646.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(nil),1)
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetCode(EFFECT_CHANGE_CODE)
	e1:SetRange(LOCATION_MZONE+LOCATION_GRAVE)
	e1:SetValue(70902743)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetTarget(c13790646.destg)
	e2:SetOperation(c13790646.desop)
	c:RegisterEffect(e2)
end

function c13790646.filter(c,atk)
	return c:IsFaceup() and bit.band(c:GetSummonType(),SUMMON_TYPE_SPECIAL)==SUMMON_TYPE_SPECIAL and c:IsDestructable() and c:GetAttack()<=atk 
end
function c13790646.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local c=e:GetHandler()
	local g=Duel.GetMatchingGroup(c13790646.filter,tp,LOCATION_MZONE,LOCATION_MZONE,c,c:GetAttack())
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c13790646.desop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local g=Duel.GetMatchingGroup(c13790646.filter,tp,LOCATION_MZONE,LOCATION_MZONE,c,c:GetAttack())
	if g and Duel.Destroy(g,REASON_EFFECT) then
		local ct=Duel.GetOperatedGroup():GetCount()
		Duel.BreakEffect()
		Duel.Damage(1-tp,ct*500,REASON_EFFECT)
	end
end
