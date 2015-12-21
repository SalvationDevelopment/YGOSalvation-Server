--キャット・ガール
function c100000172.initial_effect(c)
	--atk,def
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_ATKCHANGE+CATEGORY_DEFCHANGE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_FIELD)
	e1:SetCode(EVENT_CHANGE_POS)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCondition(c100000172.con)
	e1:SetTarget(c100000172.adtg)
	e1:SetOperation(c100000172.adop)
	c:RegisterEffect(e1)	
	local e2=e1:Clone()
	e2:SetCategory(CATEGORY_DEFCHANGE)
	e2:SetCode(EVENT_FLIP_SUMMON)
	e2:SetCondition(c100000172.condition1)
	e2:SetTarget(c100000172.target1)
	e2:SetOperation(c100000172.activate1)
	c:RegisterEffect(e2)
end
function c100000172.con(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()~=tp and e:GetHandler():GetFlagEffect(100000173)==0 
end
function c100000172.cfilter(c,tp)
	local np=c:GetPosition()
	local pp=c:GetPreviousPosition()
	return c:IsControler(tp) and ((pp==0x1 and np==0x4) or (pp==0x4 and np==0x1))
end
function c100000172.adtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return eg:IsContains(chkc) and c100000172.cfilter(chkc,1-tp) end
	if chk==0 then return eg:IsExists(c100000172.cfilter,1,nil,1-tp) end
	return true
end
function c100000172.adop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:Filter(c100000172.cfilter,nil,1-tp)
	Duel.ChangePosition(tc,POS_FACEUP_DEFENCE,POS_FACEUP_ATTACK,POS_FACEUP_ATTACK,POS_FACEUP_ATTACK,false)	
	e:GetHandler():RegisterFlagEffect(100000172,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end

function c100000172.condition1(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentChain()==0 and Duel.GetTurnPlayer()~=tp and e:GetHandler():GetFlagEffect(100000172)==0 
end
function c100000172.target1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_DISABLE_SUMMON,eg,1,0,0)
end
function c100000172.activate1(e,tp,eg,ep,ev,re,r,rp)
	if eg:GetFirst():IsType(TYPE_FLIP) then 
	--disable effect
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_CHAIN_SOLVING)
	e1:SetRange(LOCATION_MZONE)	
	e1:SetCountLimit(1)
	e1:SetOperation(c100000172.disop)	
	e1:SetReset(RESET_EVENT+RESET_PHASE+PHASE_END)
	e:GetHandler():RegisterEffect(e1)
	end
	Duel.ChangePosition(eg:GetFirst(),POS_FACEDOWN_DEFENCE)	
	e:GetHandler():RegisterFlagEffect(100000173,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end
function c100000172.disop(e,tp,eg,ep,ev,re,r,rp)
	if re:IsActiveType(TYPE_FLIP) then Duel.NegateEffect(ev) end
end