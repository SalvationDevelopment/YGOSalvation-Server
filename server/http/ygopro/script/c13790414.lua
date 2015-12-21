--Dreamland
function c13790414.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13790414)
	c:RegisterEffect(e1)
	--~ Synchro
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_ATKCHANGE)
	e2:SetDescription(aux.Stringid(13790414,0))
	e2:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_FIELD)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DELAY)
	e2:SetRange(LOCATION_FZONE)
	e2:SetCode(EVENT_SUMMON_SUCCESS)
	e2:SetTarget(c13790414.target)
	e2:SetOperation(c13790414.operation)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_ATKCHANGE)
	e3:SetDescription(aux.Stringid(13790414,0))
	e3:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_FIELD)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DELAY)
	e3:SetRange(LOCATION_FZONE)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetCondition(c13790414.condition)
	e3:SetTarget(c13790414.target)
	e3:SetOperation(c13790414.operation)
	c:RegisterEffect(e3)
	--~ fusion
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e4:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DELAY)
	e4:SetDescription(aux.Stringid(13790414,1))
	e4:SetRange(LOCATION_FZONE)
	e4:SetCode(EVENT_TO_GRAVE)
	e4:SetCountLimit(1)
	e4:SetCondition(c13790414.scon)
	e4:SetTarget(c13790414.stg)
	e4:SetOperation(c13790414.sop)
	c:RegisterEffect(e4)
	--~ Xyz
	local e5=Effect.CreateEffect(c)
	e5:SetCategory(CATEGORY_DESTROY)
	e5:SetCode(EVENT_PHASE+PHASE_END)
	e5:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e5:SetRange(LOCATION_FZONE)
	e5:SetCountLimit(1)
	e5:SetCondition(c13790414.descon)
	e5:SetTarget(c13790414.destg)
	e5:SetOperation(c13790414.desop)
	c:RegisterEffect(e5)
end
function c13790414.fusfilter(c,tp)
	return c:IsFaceup() and c:IsType(TYPE_FUSION)
end
function c13790414.synfilter(c,tp)
	return c:IsFaceup() and c:IsType(TYPE_SYNCHRO)
end
function c13790414.xyzfilter(c,tp)
	return c:IsFaceup() and c:IsType(TYPE_XYZ)
end
--~ fusion
function c13790414.sfilter(c,tp)
	return c:IsPreviousLocation(LOCATION_HAND+LOCATION_ONFIELD) and c:IsLocation(LOCATION_GRAVE) and c:GetPreviousControler()==tp and c:IsType(TYPE_MONSTER)
	
end
function c13790414.scon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c13790414.sfilter,1,nil,tp) and e:GetHandler():IsStatus(STATUS_ACTIVATED)
	and Duel.IsExistingMatchingCard(c13790414.fusfilter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,nil)
end
function c13790414.stg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,1) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(1)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
end
function c13790414.sop(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Draw(p,d,REASON_EFFECT)
end
--~ synchro
function c13790414.condition(e,tp,eg,ep,ev,re,r,rp)
	return not eg:IsExists(Card.IsType,1,nil,TYPE_XYZ)
end
function c13790414.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local tc=eg:GetFirst()
	if chk==0 then return eg:GetCount()==1 and Duel.IsExistingMatchingCard(c13790414.synfilter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,nil) end
	tc:CreateEffectRelation(e)
end
function c13790414.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=eg:GetFirst()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_LEVEL)
		e1:SetValue(1)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1)
	end
end
--~ Xyz
function c13790414.desfilter(c)
	return c:IsFaceup() and c:IsDestructable() and not c:IsType(TYPE_XYZ)
end
function c13790414.descon(e,tp,eg,ep,ev,re,r,rp)
	return tp==Duel.GetTurnPlayer() and Duel.IsExistingMatchingCard(c13790414.xyzfilter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,nil) 
end
function c13790414.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790414.desfilter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	local g=Duel.GetMatchingGroup(c13790414.desfilter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	if g:GetCount()>0 then
		local tg=g:GetMaxGroup(Card.GetLevel)
		Duel.SetOperationInfo(0,CATEGORY_DESTROY,tg,1,0,0)
	end
end
function c13790414.desop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c13790414.desfilter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	if g:GetCount()>0 then
		local tg=g:GetMaxGroup(Card.GetLevel)			
		if tg:GetCount()>1 then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
			local sg=tg:Select(tp,1,1,nil)
			Duel.Destroy(sg,REASON_EFFECT)
		else Duel.Destroy(tg,REASON_EFFECT) end
	end
end
