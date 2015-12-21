--Doom Virus Dragon
function c13790565.initial_effect(c)
	c:EnableReviveLimit()
	--Cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c13790565.splimit)
	c:RegisterEffect(e1)
	--des
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetTarget(c13790565.destg)
	e2:SetOperation(c13790565.desop)
	c:RegisterEffect(e2)
end
function c13790565.splimit(e,se,sp,st)
	return se:GetHandler():IsCode(13790552)
end
function c13790565.destroyfilter(c)
	return c:GetAttack()>=1500 and c:IsDestructable()
end
function c13790565.filter(c)
	return c:IsOnField() or c:IsLocation(LOCATION_HAND)
end
function c13790565.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790565.filter,tp,0,LOCATION_HAND+LOCATION_MZONE,1,nil) end
end
function c13790565.desop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c13790565.filter,tp,0,LOCATION_HAND+LOCATION_MZONE,nil)
	Duel.ConfirmCards(tp,g)
		local dg=g:Filter(c13790565.destroyfilter,nil)
		Duel.Destroy(dg,REASON_EFFECT)
		Duel.ShuffleHand(1-tp)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetProperty(EFFECT_FLAG_DELAY)
		e1:SetCode(EVENT_DRAW)
		e1:SetOperation(c13790565.desop2)
		e1:SetReset(RESET_PHASE+PHASE_END+RESET_OPPO_TURN,3)
		Duel.RegisterEffect(e1,tp)
end
function c13790565.desop2(e,tp,eg,ep,ev,re,r,rp)
	if ep==e:GetOwnerPlayer() then return end
	local hg=eg:Filter(Card.IsLocation,nil,LOCATION_HAND)
	if hg:GetCount()==0 then return end
	Duel.ConfirmCards(1-ep,hg)
	local dg=hg:Filter(c13790565.destroyfilter,nil)
	Duel.Destroy(dg,REASON_EFFECT)
	Duel.ShuffleHand(ep)
end
