--Chariot Pile
function c11111121.initial_effect(c)
	--act
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCost(c11111121.atkcost)
	e1:SetCondition(c11111121.atkcon)
	e1:SetTarget(c11111121.atktg)
	e1:SetOperation(c11111121.atkop)
	c:RegisterEffect(e1)
	--damage
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(11111121,0))
	e2:SetCategory(CATEGORY_DAMAGE)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetCountLimit(1)
	e2:SetRange(LOCATION_SZONE)
	e2:SetTarget(c11111121.target)
	e2:SetOperation(c11111121.operation)
	c:RegisterEffect(e2)
	--act
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_ACTIVATE)
	e3:SetCode(EVENT_FREE_CHAIN)
	e3:SetCondition(c11111121.actcon)
	c:RegisterEffect(e3)
	--negate&destroy
	local e4=Effect.CreateEffect(c)
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e4:SetType(EFFECT_TYPE_QUICK_O)
	e4:SetCode(EVENT_ATTACK_ANNOUNCE)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCost(c11111121.atkcost)
	e4:SetCondition(c11111121.atkcon)
	e4:SetTarget(c11111121.atktg)
	e4:SetOperation(c11111121.atkop)
	c:RegisterEffect(e4)
end

function c11111121.actcon(e,tp,eg,ep,ev,re,r,rp)
	local ph=Duel.GetCurrentPhase()
	return Duel.GetTurnPlayer()==tp and (ph==PHASE_MAIN1 or ph==PHASE_MAIN2)
end
function c11111121.atkcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckLPCost(tp,800) end
	Duel.PayLPCost(tp,800)
end
function c11111121.atkcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()~=tp and Duel.GetAttackTarget()==nil
		and eg:GetFirst():IsLocation(LOCATION_MZONE) and not e:GetHandler():IsStatus(STATUS_CHAINING)
end

function c11111121.atktg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local tg=Duel.GetAttacker()
	if chkc then return chkc==tg end
	if chk==0 then return tg:IsOnField() and tg:IsDestructable() and tg:IsCanBeEffectTarget(e) end
	Duel.SetTargetCard(tg)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,tg,1,0,0)
end
function c11111121.atkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsAttackable() and not tc:IsStatus(STATUS_ATTACK_CANCELED) then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end
function c11111121.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetTargetPlayer(1-tp)
	Duel.SetTargetParam(800)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,800)
end

function c11111121.operation(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	local dis=false
	if Duel.IsChainDisablable(0) and Duel.CheckReleaseGroup(1-tp,nil,1,nil) then
		if Duel.SelectYesNo(1-tp,aux.Stringid(11111121,0)) then
			Duel.Hint(HINT_SELECTMSG,1-tp,HINTMSG_CONFIRM)
			local sg=Duel.SelectReleaseGroup(1-tp,nil,1,1,nil)
			Duel.Release(sg,REASON_COST)
			dis=true
		end
	end
	if not dis then Duel.Damage(p,d,REASON_EFFECT) end
end

