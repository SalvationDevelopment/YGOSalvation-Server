--ＢＫ チート・コミッショナー
function c80600049.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,3),2)
	c:EnableReviveLimit()
	--must attack if able
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_MUST_ATTACK)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(0,LOCATION_MZONE)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_EP)
	e2:SetRange(LOCATION_MZONE)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetTargetRange(0,1)
	e2:SetCondition(c80600049.becon)
	c:RegisterEffect(e2)
	--cannot be battle target
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c80600049.atcon)
	e3:SetValue(1)
	c:RegisterEffect(e3)
	--steal spell
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e4:SetCode(EVENT_ATTACK_ANNOUNCE)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCondition(c80600049.con)
	e4:SetCost(c80600049.cost)
	e4:SetTarget(c80600049.target)
	e4:SetOperation(c80600049.op)
	c:RegisterEffect(e4)
end
function c80600049.atcon(e)
	return Duel.IsExistingMatchingCard(c80600049.filter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,e:GetHandler())
end
function c80600049.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x84)
end
function c80600049.atkfilter(c)
	return c:IsAttackable()
end
function c80600049.becon(e)
	return Duel.IsExistingMatchingCard(c80600049.atkfilter,e:GetHandlerPlayer(),0,LOCATION_MZONE,1,nil)
end
function c80600049.con(e,tp,eg,ep,ev,re,r,rp)
	local a
	local ap=Duel.GetTurnPlayer()
	if ap==tp then 
		a=Duel.GetAttacker()
	else 
		a=Duel.GetAttackTarget()
	end
	return e:GetHandler()~=a and a:IsSetCard(0x84) and a:GetOwner()==tp
end
function c80600049.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,2,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,2,2,REASON_COST)
end

function c80600049.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,0,LOCATION_HAND)>0 and Duel.GetLocationCount(tp,LOCATION_SZONE)>0  end
end
function c80600049.op(e,tp,eg,ep,ev,re,r,rp)
		local hg=Duel.GetFieldGroup(tp,0,LOCATION_HAND)
		local lc=Duel.GetLocationCount(tp,LOCATION_SZONE)
		if hg:GetCount()==0 or lc<1 then return end
		Duel.ConfirmCards(tp,hg)
		if Duel.IsExistingMatchingCard(Card.IsType,tp,0,LOCATION_HAND,1,nil,TYPE_SPELL) then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
			local sg=Duel.SelectTarget(tp,Card.IsType,tp,0,LOCATION_HAND,1,1,nil,TYPE_SPELL)
			Duel.SSet(tp,sg:GetFirst())
		end
		Duel.ShuffleHand(1-tp)
end