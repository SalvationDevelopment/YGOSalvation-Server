--Kaiju Capture Mission
function c81057455.initial_effect(c)
	c:EnableCounterPermit(0x2a)
	c:SetCounterLimit(0x2a,3)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c81057455.target1)
	e1:SetOperation(c81057455.operation)
	c:RegisterEffect(e1)
	--todef
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c81057455.condition)
	e2:SetTarget(c81057455.target2)
	e2:SetOperation(c81057455.operation)
	e2:SetLabel(1)
	c:RegisterEffect(e2)
	--draw
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(81057455,1))
	e3:SetCategory(CATEGORY_DRAW)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_DESTROYED)
	e3:SetProperty(EFFECT_FLAG_DELAY)
	e3:SetCountLimit(1,81057455)
	e3:SetCondition(c81057455.drcon)
	e3:SetTarget(c81057455.drtg)
	e3:SetOperation(c81057455.drop)
	c:RegisterEffect(e3)
end

function c81057455.filter(c)
	return c:IsFaceup() and c:IsCanTurnSet() and c:IsSetCard(0x223)
end
function c81057455.condition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetCounter(0x2a)<3 
end
function c81057455.target1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	if Duel.IsExistingTarget(c81057455.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil)
		and e:GetHandler():GetFlagEffect(81057455)==0
		and Duel.SelectYesNo(tp,aux.Stringid(81057455,0)) then
		e:SetCategory(CATEGORY_POSITION)
		e:SetProperty(EFFECT_FLAG_CARD_TARGET)
		local g=Duel.SelectTarget(tp,c81057455.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
		Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
		e:SetLabel(1)
		e:GetHandler():RegisterFlagEffect(81057455,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	else
		e:SetCategory(0)
		e:SetProperty(0)
		e:SetLabel(0)
	end
end
function c81057455.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c81057455.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c81057455.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil)
	and e:GetHandler():GetFlagEffect(81057455)==0 end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c81057455.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c81057455.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if e:GetLabel()==0 then return end
	if tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.ChangePosition(tc,POS_FACEDOWN_DEFENCE)
		e:GetHandler():AddCounter(0x2a,1)
	end
end
function c81057455.drcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return rp~=tp and c:IsLocation(LOCATION_GRAVE) and c:GetPreviousControler()==tp
end
function c81057455.drtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,2) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(2)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,2)
end
function c81057455.drop(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Draw(p,d,REASON_EFFECT)
end